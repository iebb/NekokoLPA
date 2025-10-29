import React, {useEffect} from 'react';
import {Alert, Image, PixelRatio, ScrollView, TouchableOpacity,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Colors, Drawer} from "react-native-ui-lib";
import {Text} from 'tamagui';
import {View} from 'react-native';
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {Adapters} from "@/native/adapters/registry";
import {Notification} from "@/native/types/LPA";
import {parseMetadataOnly} from "@/utils/parser";
import {Flags} from "@/assets/flags";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faBan, faCircleCheck, faDownload, faPaperPlane, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useToast} from "@/components/common/ToastProvider";
import {useLoading} from "@/components/common/LoadingProvider";

function Notifications({ route,  navigation }: RootScreenProps<'Notifications'>) {
  const { deviceId } = route.params;
  const DeviceState = useSelector(selectDeviceState(deviceId!));
  const { showToast } = useToast();
  const { t } = useTranslation(['main']);
  const { profiles, notifications } = DeviceState;
  const { setLoading } = useLoading();

  const adapter = Adapters[deviceId];

  useEffect(() => {
    setLoading(true);
    adapter.getNotifications().then(() => setLoading(false));
  }, []);

  const renderRow = (row: Notification) => {

    const metadata = profiles.find(p => p.iccid === row.iccid);

    const { name, country } = metadata ? parseMetadataOnly(metadata) : {name: "unknown", country: "WW"};

    var iconType = faDownload;
    var type = 'download';

    switch (row.profileManagementOperation) {
      case 0x10:
        iconType = faTrash;
        type = 'delete';
        break;
      case 0x20:
        iconType = faBan;
        type = 'disable';
        break;
      case 0x40:
        iconType = faCircleCheck;
        type = 'enable';
        break;
      case 0x80:
        iconType = faDownload;
        type = 'install';
        break;
    }

    return (
      <View key={row.seqNumber} style={{ backgroundColor: Colors.pageBackground, marginBottom: 10 }}>
        <Drawer
          style={{
            overflow: "hidden",
          }}
          rightItems={[{
            customElement: (
              <FontAwesomeIcon icon={faPaperPlane} style={{ color: Colors.buttonForeground }} />
            ),
            width: 60,
            background: Colors.green30,
            onPress: async () => {
              const result = await adapter.sendNotification(row.seqNumber);
              if (result.result !== 0) {
                Alert.alert(t('main:notifications_send_failed'), t('main:notifications_send_failed_alert'));
                showToast(t('main:notifications_send_failed'), 'error');
              } else {
                showToast(t('main:notifications_send_success'), 'success');
              }
            }
          }]}
          leftItem={{
            customElement: (
              <FontAwesomeIcon icon={faTrash} style={{ color: Colors.buttonForeground }} />
            ),
            width: 60,
            background: Colors.red30,
            onPress: () => Alert.alert(
              t('main:notifications_delete'),
              t('main:notifications_delete_alert'), [
                {
                  text: t('main:notifications_delete_cancel'),
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: t('main:notifications_delete_ok'),
                  style: 'destructive',
                  onPress: async () => {
                    const result = await adapter.sendNotification(row.seqNumber);
                    if (result.result === 0) {
                      await adapter.deleteNotification(row.seqNumber);
                    } else {
                      Alert.alert(t('main:notifications_send_failed'), t('main:notifications_send_failed_alert'));
                    }
                  }
                },
              ])
          }}
        >
          <TouchableOpacity>
            <View style={{ flexDirection: 'row', backgroundColor: Colors.pageBackground, paddingHorizontal: 20, paddingVertical: 10 }}>
              <View style={{ flexGrow: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text color="$textDefault" numberOfLines={1} style={{ marginRight: 10 }}>
                    #{row.seqNumber}
                  </Text>
                  <Text color="$textDefault" numberOfLines={1}>
                    <Image
                      style={{width: 20 * PixelRatio.getFontScale(), height: 20 * PixelRatio.getFontScale()}}
                      source={Flags[country] || Flags.UN}
                    />
                    {
                      metadata ? ` [${country}] ${name}` : ` ${row.iccid}`
                    }
                  </Text>
                </View>
                <View>
                  <Text color="$textNeutral" fontSize={12}>RSP: {row.notificationAddress}</Text>
                  <Text color="$textNeutral" fontSize={12}>ICCID: {row.iccid}</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text style={{ textAlign: 'right', height: 20 }}>
                    <FontAwesomeIcon icon={iconType} style={{ color: Colors.$iconNeutral }} size={20} />
                  </Text>
                  <Text style={{ marginTop: 5, textAlign: 'right', color: Colors.$iconNeutral, fontSize: 12 }}>{type}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Drawer>
      </View>
    );
  }
  const sorted = Array.isArray(notifications) ?  [...notifications].sort((a, b) => b.seqNumber - a.seqNumber) : [];
  return (
    <SafeScreen>
      <Title>{t('main:notifications_notifications')}</Title>
      <View paddingV-20>
        <ScrollView>
          {
            sorted.map(item => renderRow(item))
          }
        </ScrollView>
      </View>
    </SafeScreen>
  );

}

export default Notifications;
