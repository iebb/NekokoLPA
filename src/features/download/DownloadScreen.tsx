import React, {useState} from 'react';
import {Platform} from 'react-native';
import type {RootScreenProps} from '@/app/navigation/types';
import {ScannerInitial} from '@/features/download/ScannerInitial';
import {ScannerAuthentication} from '@/features/download/ScannerAuthentication';
import {ScannerResult} from '@/features/download/ScannerResult';
import {AppVersion} from '@/shared/config/app';
import {sizeStats} from '@/shared/storage';
import {Adapters} from '@/lpa/adapters/registry';
import {useSelector} from 'react-redux';
import {View} from 'react-native';
import {selectDeviceState} from '@/store';

const REPORTING_URL = 'https://nlpa-data.nekoko.ee/api/collection/v2';

function Scanner({route, navigation}: RootScreenProps<'Scanner'>) {
  const {deviceId, appLink} = route.params;

  // Hooks must run unconditionally; an empty deviceId simply selects nothing.
  const DeviceState = useSelector(selectDeviceState(deviceId ?? ''));
  const [scanState, setScanState] = useState(0);
  const [authenticateResult, setAuthenticateResult] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [smdpAddress, setSmdpAddress] = useState('');
  const adapter = deviceId ? Adapters[deviceId] : null;

  return (
    <View style={{flex: 1}}>
      {scanState === 0 && (
        <ScannerInitial
          appLink={appLink}
          adapter={adapter}
          deviceId={deviceId}
          finishAuthenticate={({authenticateResult, smdp, confirmationCode}: any) => {
            setAuthenticateResult(authenticateResult);
            setSmdpAddress(smdp);
            setConfirmationCode(confirmationCode);
            setScanState(1);
          }}
        />
      )}
      {scanState === 1 && (
        <ScannerAuthentication
          eUICC={DeviceState}
          adapter={adapter}
          deviceId={deviceId}
          initialConfirmationCode={confirmationCode}
          authenticateResult={authenticateResult}
          goBack={() => {
            setScanState(0);
          }}
          confirmDownload={({downloadResult}: any) => {
            // @ts-ignore
            const m = authenticateResult.profile;
            const v = {
              smdpAddress,
              ...downloadResult,
              ...(authenticateResult || {}),
              appVersion: AppVersion,
              appOS: Platform.OS,
            };
            delete v['_internal'];
            fetch(REPORTING_URL, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(v),
            })
              .then(d => d.json())
              .catch(e => console.error('Failed to report download result', e));

            if (downloadResult?.space_consumed) {
              sizeStats.set(m.iccid, downloadResult.space_consumed);
            }

            setDownloadResult(downloadResult);
            setScanState(3);
          }}
        />
      )}
      {scanState === 3 && (
        <ScannerResult
          eUICC={DeviceState}
          adapter={adapter}
          deviceId={deviceId}
          initialConfirmationCode={confirmationCode}
          authenticateResult={authenticateResult}
          downloadResult={downloadResult}
          goBack={() => {
            setScanState(0);
            setDownloadResult(null);
            setAuthenticateResult(null);
            navigation.goBack();
          }}
        />
      )}
    </View>
  );
}

export default Scanner;
