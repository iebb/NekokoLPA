import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Image} from 'react-native';
import {Text as TText, useTheme} from 'tamagui';
import {
  ArrowLeft,
  Download,
  Code,
  Settings,
  Flag,
  ShoppingCart,
  Bluetooth,
} from '@tamagui/lucide-icons';
import {
  AppBuyLink,
  AppLogo,
  AppTitle,
  GithubLink,
  AppBuyLinkEsimData,
  AppVersion,
} from '@/shared/config/app';
import {Linking} from 'react-native';

export default function LeftSidebarDrawer({navigation}: DrawerContentComponentProps) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  // Copied to a local so TypeScript can narrow it inside the onPress closure.
  const esimDataLink = AppBuyLinkEsimData;
  const menuItems = [
    {
      title: 'Main',
      label: 'main:main_screen',
      icon: ArrowLeft,
      onPress: (navigation: any) => navigation.navigate('Stack', {screen: 'Main'}),
    },
    {
      title: 'Bluetooth',
      label: 'main:bluetooth_scan',
      icon: Bluetooth,
      onPress: (navigation: any) => navigation.navigate('Stack', {screen: 'BluetoothScan'}),
    },
    {
      title: 'Stats',
      label: 'main:profile_collection_stats',
      icon: Flag,
      onPress: (navigation: any) => navigation.navigate('Stack', {screen: 'Stats'}),
    },
    {
      title: 'Devices',
      label: 'main:purchase_note',
      icon: ShoppingCart,
      onPress: () => Linking.openURL(AppBuyLink),
    },
    ...(esimDataLink
      ? [
          {
            title: 'eSIM Data',
            label: 'main:buy_esim_data',
            icon: ShoppingCart,
            onPress: () => Linking.openURL(esimDataLink),
          },
        ]
      : []),
    {
      title: 'Github',
      label: 'main:github',
      icon: Code,
      onPress: () => Linking.openURL(GithubLink),
    },
    {
      title: 'Backup',
      label: 'main:backup',
      icon: Download,
      onPress: (navigation: any) => navigation.navigate('Stack', {screen: 'Backup'}),
    },
    {
      title: 'Settings',
      label: 'main:settings_settings',
      icon: Settings,
      onPress: (navigation: any) => navigation.navigate('Stack', {screen: 'Settings'}),
    },
  ];

  return (
    <DrawerContentScrollView>
      <View style={{flexDirection: 'row', gap: 5, flex: 1, paddingHorizontal: 5}}>
        <Image source={AppLogo} style={{width: 42, height: 42}} />
        <View>
          <View>
            <TText color="$textDefault" fontSize={16} fontWeight={'700' as any}>
              {AppTitle}
            </TText>
          </View>
          <View>
            <TText color="$color6" fontSize={12}>
              v{AppVersion}
            </TText>
          </View>
        </View>
      </View>
      <View style={{paddingTop: 10}}>
        {menuItems.map((item, i) => {
          return (
            <DrawerItem
              key={i}
              inactiveTintColor={theme.color6?.val || theme.color?.val}
              activeTintColor={theme.primaryColor?.val || theme.color?.val}
              icon={({size, color}) => {
                const IconComponent = item.icon;
                return <IconComponent size={size} color={color} />;
              }}
              label={t(item.label)}
              labelStyle={{
                color: theme.textDefault?.val || theme.color?.val,
              }}
              onPress={() => item.onPress(navigation)}
            />
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}
