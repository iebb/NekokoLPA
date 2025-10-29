import {ActionSheet, Button, Card, Colors, Text, View} from "react-native-ui-lib";
import React, {useState, useMemo, useCallback} from "react";
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {Adapters} from "@/native/adapters/registry";
import {NativeModules, Platform, ToastAndroid} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import prompt from "react-native-prompt-android";
import {preferences} from "@/utils/mmkv";
import {formatSize} from "@/utils/size";
import {toCIName, toFriendlyName} from "@/utils/friendlyName";
import {getNicknameByEid, setNicknameByEid} from "@/configs/store";
import {RootState} from "@/redux/reduxDataStore";
import {makeLoading} from "@/components/utils/loading";
import {useToast} from "@/components/common/ToastProvider";
import {useLoading} from "@/components/common/LoadingProvider";

// Extracted components
const ActionSheetOptions = React.memo(({ 
  deviceId, 
  DeviceState, 
  adapter, 
  navigation, 
  euiccMenu,
  setEuiccMenu, 
  setLoading, 
  showToast 
}: { 
  deviceId: string; 
  DeviceState: any; 
  adapter: any; 
 navigation: any; 
  euiccMenu: boolean;
  setEuiccMenu: (visible: boolean) => void; 
  setLoading: any; 
  showToast: any; 
}) => {
  const { t } = useTranslation(['main']);

  const handleEidCopy = useCallback(() => {
    ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
    Clipboard.setString(DeviceState.eid!);
  }, [DeviceState.eid]);

  const handleOpenSTK = useCallback(() => {
    const { OMAPIBridge } = NativeModules;
    OMAPIBridge.openSTK(adapter.device.deviceName);
  }, [adapter.device.deviceName]);

  const handleEuiccInfo = useCallback(() => {
    navigation.navigate('EuiccInfo', { deviceId });
  }, [navigation, deviceId]);

  const handleDownloadProfile = useCallback(() => {
    navigation.navigate('Scanner', { deviceId });
  }, [navigation, deviceId]);

  const handleSetNickname = useCallback(() => {
    prompt(
      t('main:set_nickname'),
      t('main:set_nickname_prompt'),
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {text: 'OK', onPress: (nickname: string) => {
          if (DeviceState!.eid) setNicknameByEid(DeviceState!.eid!, nickname);
        }},
      ],
      {
        cancelable: true,
        defaultValue: getNicknameByEid(DeviceState.eid!),
        placeholder: 'placeholder'
      }
    );
  }, [t, DeviceState.eid]);

  const handleManageNotifications = useCallback(() => {
    navigation.navigate('Notifications', { deviceId });
  }, [navigation, deviceId]);

  const handleSendNotifications = useCallback(async () => {
    makeLoading(
      setLoading,
      async () => {
        showToast('Processing Notifications. This may take some time.', 'success');
        await adapter.processNotifications('');
        showToast('Processing Notifications. This may take some time.', 'success');
      }
    );
  }, [setLoading, adapter, showToast]);

  const handleCancel = useCallback(() => {
    setEuiccMenu(false);
  }, [setEuiccMenu]);

  const options = useMemo(() => [
    {
      label: t('main:eid_copy'),
      onPress: handleEidCopy
    },
    ...(((Platform.OS === 'android' && deviceId.startsWith("omapi")) ? [{
      label: t('main:open_stk_menu'),
      onPress: handleOpenSTK
    }] : [])),
    {
      label: 'EUICC Info',
      onPress: handleEuiccInfo
    },
    {
      label: t('main:download_profile'),
      onPress: handleDownloadProfile
    },
    {
      label: t('main:set_nickname'),
      onPress: handleSetNickname
    },
    {
      label: t('main:manage_notifications'),
      onPress: handleManageNotifications
    },
    {
      label: t('main:notifications_send'),
      onPress: handleSendNotifications
    },
    {
      label: 'Cancel',
      onPress: handleCancel
    }
  ], [
    t, deviceId, adapter, navigation, 
    handleEidCopy, handleOpenSTK, handleEuiccInfo, handleDownloadProfile,
    handleSetNickname, handleManageNotifications, handleSendNotifications, handleCancel
  ]);

  return (
    <ActionSheet
      title={`EID: ${DeviceState?.eid}`}
      containerStyle={{
        backgroundColor: Colors.cardBackground,
      }}
      cancelButtonIndex={options.length - 1}
      options={options}
      visible={euiccMenu}
      useNativeIOS
      onDismiss={() => setEuiccMenu(false)}
    />
  );
});

const CardContent = React.memo(({ 
  DeviceState, 
  maskedEid, 
  supplementText 
}: { 
  DeviceState: any; 
  maskedEid: string; 
  supplementText: string; 
}) => {
  const { t } = useTranslation(['main']);

  return (
    <View paddingH-10 paddingV-3 flexG style={{ flex: 1 }}>
      {/* First Row */}
      <View row style={{ width: '100%' }}>
        <Text text100L $textDefault numberOfLines={1}>
          {t('main:available_space', {
            size: formatSize(DeviceState.bytesFree),
          })}
        </Text>
        <Text
          text100L
          $textDefault
          style={{ textAlign: 'right', flexGrow: 1 }}
          numberOfLines={1}
        >
          CI: {DeviceState.euiccInfo2?.euiccCiPKIdListForSigning.map((x: any) => toCIName(x)).join(', ')}
        </Text>
      </View>

      {/* Second Row */}
      <View row style={{ width: '100%' }}>
        <Text text100L $textDefault>
          EID: {maskedEid}
        </Text>
        <Text
          text100L
          $textDefault
          style={{ textAlign: 'right', flexGrow: 1 }}
          numberOfLines={1}
        >
          {supplementText}
        </Text>
      </View>
    </View>
  );
});

const AddProfileButton = React.memo(({ 
  deviceId, 
  navigation 
}: { 
  deviceId: string; 
  navigation: any; 
}) => {
  const handlePress = useCallback(() => {
    navigation.navigate('Scanner', { deviceId });
  }, [navigation, deviceId]);

  return (
    <View flexG-1 style={{ maxWidth: 36, flex: 1 }}>
      <Button
        borderRadius={0}
        fullWidth
        round
        style={{ flex: 1, width: 36 }}
        size="small"
        onPress={handlePress}
      >
        <FontAwesomeIcon icon={faPlus} style={{ color: Colors.buttonForeground }} />
      </Button>
    </View>
  );
});

export default function ProfileCardHeader({ deviceId } : { deviceId: string }) {
  const { t } = useTranslation(['main']);
  const navigation = useNavigation();
  const [euiccMenu, setEuiccMenu] = useState(false);
  const DeviceState = useSelector((state: RootState) => state.DeviceState[deviceId]) ?? {};
  
  // Memoize preferences
  const stealthMode = useMemo(() => 
    preferences.getString("redactMode") ?? "none", 
    []
  );
  
  const adapter = Adapters[deviceId];
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  // Memoize EID processing
  const { eid, maskedEid } = useMemo(() => {
    const eid = (DeviceState?.eid) ?? "";
    const maskedEid = stealthMode === 'none' ? eid : (
      eid.substring(0, stealthMode === 'medium' ? 18 : 13) + "..."
    );
    return { eid, maskedEid };
  }, [DeviceState?.eid, stealthMode]);

  // Memoize supplement text
  const supplementText = useMemo(() => 
    toFriendlyName(eid, DeviceState.euiccInfo2), 
    [eid, DeviceState.euiccInfo2]
  );

  // Memoize action sheet visibility
  const shouldShowActionSheet = useMemo(() => 
    DeviceState?.eid && euiccMenu, 
    [DeviceState?.eid, euiccMenu]
  );

  const handleCardPress = useCallback(() => {
    setEuiccMenu(true);
  }, []);

  const handleActionSheetDismiss = useCallback(() => {
    setEuiccMenu(false);
  }, []);

  return (
    <View>
             {shouldShowActionSheet && (
         <ActionSheetOptions
           deviceId={deviceId}
           DeviceState={DeviceState}
           adapter={adapter}
           navigation={navigation}
           euiccMenu={euiccMenu}
           setEuiccMenu={setEuiccMenu}
           setLoading={setLoading}
           showToast={showToast}
         />
       )}
      
      <Card
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: 10,
          borderColor: Colors.$outlineNeutral,
          borderWidth: 1,
          overflow: "hidden",
          width: "100%",
          display: "flex",
          flexDirection: "row"
        }}
        row
        enableShadow
        onPress={handleCardPress}
      >
        <CardContent 
          DeviceState={DeviceState} 
          maskedEid={maskedEid} 
          supplementText={supplementText} 
        />
        
        <AddProfileButton deviceId={deviceId} navigation={navigation} />
      </Card>
    </View>
  );
}