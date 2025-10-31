import React from 'react';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {sizeStats} from "@/utils/mmkv";
import {Button as TButton, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import RNFS from 'react-native-fs';
import Share from 'react-native-share'; // optional for sharing
import DocumentPicker from 'react-native-document-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faDownload, faUpload} from '@fortawesome/free-solid-svg-icons';
import {useToast} from "@/components/common/ToastProvider";


export default function Backup({ route,  navigation }: RootScreenProps<'Backup'>) {
  const { showToast } = useToast();
  const theme = useTheme();
  const { t } = useTranslation(['main']);
  const exportFile = async () => {
    const sizeData = sizeStats.getAllKeys();
    const doc = {sizes: {}};
    for(const k of sizeData) {
      (doc.sizes as any)[k] = sizeStats.getNumber(k);
    }

    const fileName = 'export.json';
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    try {
      await RNFS.writeFile(filePath, JSON.stringify(doc), 'utf8');
      console.log('File written to:', filePath);

      // Optionally share it
      await Share.open({
        title: 'Exported Data',
        url: 'file://' + filePath,
        type: 'application/json',
      });
    } catch (err) {
      showToast('Export failed.', 'error');
      console.error('Export failed:', err);
    }
  }
  const importData = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.json],
      });

      const fileContent = await RNFS.readFile(res.uri, 'utf8');
      try {
        const { sizes } = JSON.parse(fileContent);
        for(const s of Object.keys(sizes)) {
          sizeStats.set(s, sizes[s] as number);
        }
        showToast('Import successful.', 'success');
      } catch (err) {
        showToast('Import failed.', 'error');

      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Import error:', err);
      }
      return null;
    }
  };

  return (
    <Screen title={t('main:backup')}>
      <YStack gap={10} flex={1}>
        <YStack gap={12}>
          <TButton
            flex={1}
            backgroundColor={theme.accentColor?.val}
            onPress={exportFile}
            borderRadius={12}
            paddingVertical={12}
          >
            <XStack alignItems="center" gap={10}>
              <FontAwesomeIcon
                icon={faDownload}
                style={{ color: theme.background?.val }}
              />
              <TText color={theme.background?.val} fontSize={16}>
                {t('main:backup_export')}
              </TText>
            </XStack>
          </TButton>
          <TButton
            flex={1}
            backgroundColor={theme.accentColor?.val}
            onPress={importData}
            borderRadius={12}
            paddingVertical={12}
          >
            <XStack alignItems="center" gap={10}>
              <FontAwesomeIcon
                icon={faUpload}
                style={{ color: theme.background?.val }}
              />
              <TText color={theme.background?.val} fontSize={16}>
                {t('main:backup_import')}
              </TText>
            </XStack>
          </TButton>
        </YStack>
      </YStack>
    </Screen>
  );

}
