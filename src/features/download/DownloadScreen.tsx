import React, {useState} from 'react';
import type {RootScreenProps} from '@/app/navigation/types';
import {ScannerInitial} from '@/features/download/ScannerInitial';
import {ScannerAuthentication} from '@/features/download/ScannerAuthentication';
import {ScannerResult} from '@/features/download/ScannerResult';
import {Adapters} from '@/lpa/adapters/registry';
import {useSelector} from 'react-redux';
import {View} from 'react-native';
import {selectDeviceState} from '@/store';

function Scanner({route, navigation}: RootScreenProps<'Scanner'>) {
  const {deviceId, appLink} = route.params;

  // Hooks must run unconditionally; an empty deviceId simply selects nothing.
  const DeviceState = useSelector(selectDeviceState(deviceId ?? ''));
  const [scanState, setScanState] = useState(0);
  const [authenticateResult, setAuthenticateResult] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [, setSmdpAddress] = useState('');
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
