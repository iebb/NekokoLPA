import React, {useEffect} from 'react';
import {Alert, FlatList, Image, PixelRatio, ScrollView, TouchableOpacity,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Colors, Drawer, ListItem, Text, View} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {useTheme} from "@/theme";
import {Adapters} from "@/native/adapters/registry";
import {Notification} from "@/native/types/LPA";
import {parseMetadataOnly} from "@/screens/Main/MainUI/ProfileList/parser";
import {Flags} from "@/assets/flags";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faBan, faCircleCheck, faDownload, faPaperPlane, faTrash} from "@fortawesome/free-solid-svg-icons";

function Notifications({ route,  navigation }: RootScreenProps<'Notifications'>) {
  const { deviceId } = route.params;
  const DeviceState = useSelector(selectDeviceState(deviceId!));
  const { colors } = useTheme();
  const { t } = useTranslation(['notifications']);
  const { profiles, notifications } = DeviceState;

  const adapter = Adapters[deviceId];

  useEffect(() => {
    adapter.getNotifications();
  }, []);

  const renderRow = (row: Notification) => {

    const metadata = profiles.find(p => p.iccid === row.iccid);

    const { name, country } = metadata ? parseMetadataOnly(metadata) : {name: "unknown", country: "WW"};

    // row.profileManagementOperation ==

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
      <View key={row.seqNumber} backgroundColor={colors.std900} marginB-10>
      <Drawer
        style={{
          overflow: "hidden",
        }}
        rightItems={[{
          customElement: (
            <FontAwesomeIcon icon={faPaperPlane} style={{ color: colors.cardBackground, }} />
          ),
          width: 60,
          background: Colors.green30,
          onPress: async () => {
            const result = await adapter.sendNotification(row.seqNumber);
            if (result.result !== 0) {
              Alert.alert(t('notifications:send_failed'), t('notifications:send_failed_alert'));
            }
          }
        }]}
        leftItem={{
          customElement: (
            <FontAwesomeIcon icon={faTrash} style={{ color: colors.cardBackground, }} />
          ),
          width: 60,
          background: Colors.red30,
          onPress: () => Alert.alert(
            t('notifications:delete'),
            t('notifications:delete_alert'), [
              {
                text: t('notifications:delete_cancel'),
                onPress: () => {},
                style: 'cancel',
              },
              {
                text: t('notifications:delete_ok'),
                style: 'destructive',
                onPress: async () => {
                  await adapter.deleteNotification(row.seqNumber);
                }
              },
            ])
        }}
      >
        <TouchableOpacity>
        <View flex row backgroundColor={colors.std900} paddingH-20 paddingV-10 >
          <View flexG>
            <View row>
              <Text color={colors.std200} text70BL style={{width: 40}} numberOfLines={1}>
                #{row.seqNumber}
              </Text>
              <Text color={colors.std200} text70BL numberOfLines={1}>
                <Image
                  style={{width: 20 * PixelRatio.getFontScale(), height: 20 * PixelRatio.getFontScale()}}
                  source={Flags[country] || Flags.UN}
                />
                {
                  metadata && ` [${country}] ${name}`
                }
              </Text>
            </View>
            <View>
              <Text color={colors.std300} text90L>RSP: {row.notificationAddress}</Text>
              <Text color={colors.std300} text90L>ICCID: {row.iccid}</Text>
            </View>
          </View>
          <View>
            <View>
              <Text style={{ textAlign: 'right', height: 20 }}>
                <FontAwesomeIcon icon={iconType} style={{ color: colors.std300 }} size={20} />
              </Text>
              <Text marginT-5 text90L style={{ textAlign: 'right', color: colors.std300 }}>{type}</Text>
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
      <Title>{t('notifications:notifications')}</Title>
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
