import React, {PropsWithChildren, ReactNode} from 'react';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeft} from '@tamagui/lucide-icons';
import {Text as TText, useTheme, XStack} from 'tamagui';
import {useTranslation} from 'react-i18next';

import SafeScreen from '@/shared/ui/SafeScreen';
import Title from '@/shared/ui/Title';
import PageContainer from '@/shared/ui/PageContainer';
import {fontSize, iconSize} from '@/shared/theme/tokens';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  horizontalPadding?: number;
  keyboardAvoiding?: boolean;
  scrollViewProps?: any;
  fixedHeader?: ReactNode;
  /** Hides the back affordance on a screen that is a navigator root. */
  hideBack?: boolean;
}>;

export default function Screen({
  title,
  subtitle,
  horizontalPadding,
  keyboardAvoiding,
  scrollViewProps,
  fixedHeader,
  hideBack = false,
  children,
}: ScreenProps) {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const {t} = useTranslation(['main']);

  // Every pushed screen gets a back affordance from here rather than each
  // screen adding its own: on Android the hardware button made the omission
  // survivable, but on iOS and Catalyst a screen with no visible way back is a
  // dead end. `canGoBack` keeps it off navigator roots.
  const canGoBack = !hideBack && navigation.canGoBack?.();

  return (
    <SafeScreen>
      {canGoBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('main:back')}
          onPress={() => navigation.goBack()}
          style={{alignSelf: 'flex-start', paddingLeft: 12, paddingRight: 16, paddingVertical: 10}}>
          <XStack alignItems="center" gap={2}>
            <ChevronLeft size={iconSize.md} color={theme.primaryColor?.val as string} />
            <TText color="$primaryColor" fontSize={fontSize.lg}>
              {t('main:back')}
            </TText>
          </XStack>
        </TouchableOpacity>
      ) : null}
      {title ? <Title subtitle={subtitle}>{title}</Title> : null}
      {fixedHeader}
      <PageContainer
        horizontalPadding={horizontalPadding}
        keyboardAvoiding={keyboardAvoiding}
        scrollViewProps={scrollViewProps}
        topPadding={subtitle && subtitle.trim().length > 0 ? 20 : 0}>
        <>{children}</>
      </PageContainer>
    </SafeScreen>
  );
}
