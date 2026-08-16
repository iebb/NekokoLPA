import React from 'react';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as TText} from 'tamagui';

import {AppBuyLink, AppBuyLinkEsimData} from '@/shared/config/app';

/**
 * "Buy a device" / "Buy eSIM data" call-to-action links.
 *
 * Shown wherever the user has no usable eUICC to act on. The eSIM-data link is
 * only present in some build variants, hence the guard.
 */
export default function PurchaseLinks({topMargin = 40}: {topMargin?: number}) {
  const {t} = useTranslation(['main']);
  // Copied to a local so TypeScript can narrow it inside the onPress closure.
  const esimDataLink = AppBuyLinkEsimData;

  return (
    <>
      <TText
        color="$primaryColor"
        textDecorationLine="underline"
        fontSize={20}
        textAlign="center"
        marginTop={topMargin}
        onPress={() => Linking.openURL(AppBuyLink)}>
        {t('main:purchase_note')}
      </TText>
      {esimDataLink ? (
        <TText
          color="$primaryColor"
          textDecorationLine="underline"
          fontSize={20}
          textAlign="center"
          marginTop={20}
          onPress={() => Linking.openURL(esimDataLink)}>
          {t('main:buy_esim_data')}
        </TText>
      ) : null}
    </>
  );
}
