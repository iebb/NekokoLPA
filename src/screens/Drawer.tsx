import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import React from "react";
import {useTranslation} from 'react-i18next';
import {version} from '../../package.json';
import {Colors, Image, Text, View} from 'react-native-ui-lib';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeft, faCode, faCog, faFlag, faShoppingCart} from "@fortawesome/free-solid-svg-icons";
import {faBluetoothB} from "@fortawesome/free-brands-svg-icons";
import {AppBuyLink, AppLogo, GithubLink} from "@/screens/Main/config";
import {Linking} from 'react-native';


export default function LeftSidebarDrawer({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation(['main']);
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
      title: 'Settings', label: 'main:settings_settings',
      icon: faCog, onPress: (navigation: any) => navigation.navigate('Stack', { screen: 'Settings' })
    },
  ]

  return (
    <DrawerContentScrollView>
      <View row gap-5 flexG paddingH-5>
        <Image
          source={AppLogo}
          style={{width: 42, height: 42}}
        />
        <View>
          <View>
            <Text $textDefault text70BO>NekokoLPA</Text>
          </View>
          <View>
            <Text $textNeutralLight text90L>v{version}</Text>
          </View>
        </View>
      </View>
      <View paddingT-10>
        {
          menuItems.map((item, i) => {
            return (
              <DrawerItem
                key={i}
                inactiveTintColor={Colors.$iconPrimary}
                activeTintColor={Colors.$iconPrimaryLight}
                icon={
                  ({focused, size, color}) => <FontAwesomeIcon icon={item.icon as any} style={{color}}/>
                }
                label={t(item.label)}
                labelStyle={{
                  color: Colors.$textDefault,
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
