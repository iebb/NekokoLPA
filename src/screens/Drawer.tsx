import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import React from "react";
import {useTranslation} from 'react-i18next';
import {version} from '../../package.json';
import {Colors, Image, Text, View} from 'react-native-ui-lib';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag} from "@fortawesome/free-solid-svg-icons";
import {AppLogo} from "@/screens/Main/config";


export default function LeftSidebarDrawer({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation(['main']);
  const menuItems = [
    // {
    //   title: 'Back', label: 'main:go_back',
    //   icon: faArrowLeft, onPress: (navigation: any) => navigation.goBack()
    // },
    {
      title: 'Stats', label: 'main:profile_collection_stats',
      icon: faFlag, onPress: (navigation: any) => navigation.navigate('Stats', {})
    },
    {
      title: 'Settings', label: 'main:settings_settings',
      icon: faCog, onPress: (navigation: any) => navigation.navigate('Settings', {})
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
            <Text $textDefault text70BL>NekokoLPA</Text>
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
                  ({focused, size, color}) => <FontAwesomeIcon icon={item.icon} style={{color}}/>
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
