import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import React from "react";
import {useTranslation} from 'react-i18next';
import {version} from '../../package.json';
import {Colors, Text, View} from 'react-native-ui-lib';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag} from "@fortawesome/free-solid-svg-icons";


const menuItems = [
  {
    title: 'Stats', label: 'main:profile_collection_stats',
    icon: faFlag, onPress: (navigation: any) => navigation.navigate('Stats', {})
  },
  {
    title: 'Settings', label: 'main:settings_settings',
    icon: faCog, onPress: (navigation: any) => navigation.navigate('Settings', {})
  },
]

export default function LeftSidebarDrawer({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation(['main']);
  return (
    <DrawerContentScrollView>
      <View paddingH-5>
        <Text $textDefault text70BL>NekokoLPA</Text>
      </View>
      <View paddingH-5>
        <Text $textNeutralLight text90L>v{version}</Text>
      </View>
      <View paddingT-10>
        {
          menuItems.map((item, i) => {
            return (
              <DrawerItem
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
