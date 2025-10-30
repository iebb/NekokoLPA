import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import React from "react";
import {useTranslation} from 'react-i18next';
import {version} from '../../package.json';
import { View, Image } from 'react-native';
import {Text as TText, useTheme} from 'tamagui';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft, faDownload, faCode, faCog, faFlag, faShoppingCart} from "@fortawesome/free-solid-svg-icons";
import {faBluetoothB} from "@fortawesome/free-brands-svg-icons";
import {AppBuyLink, AppLogo, AppTitle, GithubLink} from "@/screens/Main/config";
import {Linking} from 'react-native';


export default function LeftSidebarDrawer({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const menuItems = [
    {
      title: 'Main', label: 'main:main_screen',
      icon: faArrowLeft, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'Main' })
    },
    {
      title: 'Bluetooth', label: 'main:bluetooth_scan',
      icon: faBluetoothB, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'BluetoothScan' })
    },
    {
      title: 'Stats', label: 'main:profile_collection_stats',
      icon: faFlag, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'Stats' })
    },
    {
      title: 'Devices', label: 'main:purchase_note',
      icon: faShoppingCart, onPress: (navigation: any) => Linking.openURL(AppBuyLink)
    },
    {
      title: 'Github', label: 'main:github',
      icon: faCode, onPress: (navigation: any) => Linking.openURL(GithubLink)
    },
    {
      title: 'Backup', label: 'main:backup',
      icon: faDownload, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'Backup' })
    },
    {
      title: 'Settings', label: 'main:settings_settings',
      icon: faCog, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'Settings' })
    },
  ]

  return (
    <DrawerContentScrollView>
      <View style={{ flexDirection: 'row', gap: 5, flex: 1, paddingHorizontal: 5 }}>
        <Image
          source={AppLogo}
          style={{width: 42, height: 42}}
        />
        <View>
          <View>
            <TText color="$textDefault" fontSize={16} fontWeight={"700" as any}>{AppTitle}</TText>
          </View>
          <View>
            <TText color="$color10" fontSize={12}>v{version}</TText>
          </View>
        </View>
      </View>
      <View style={{ paddingTop: 10 }}>
        {
          menuItems.map((item, i) => {
            return (
              <DrawerItem
                key={i}
                inactiveTintColor={theme.color10?.val || theme.color?.val || '#888'}
                activeTintColor={theme.accentColor?.val || theme.color?.val || '#6c5ce7'}
                icon={
                  ({focused, size, color}) => <FontAwesomeIcon icon={item.icon as any} style={{color}}/>
                }
                label={t(item.label)}
                labelStyle={{
                  color: theme.textDefault?.val || theme.color?.val || '#000',
                }}
                onPress={() => item.onPress(navigation)}
              />
            )
          })
        }
      </View>
    </DrawerContentScrollView>
  );
}
