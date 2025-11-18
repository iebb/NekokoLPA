import React from 'react';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {sizeStats} from "@/utils/mmkv";
import {Button as TButton, Text as TText, XStack, YStack} from 'tamagui';
import RNFS from 'react-native-fs';
import {pick, types} from '@react-native-documents/picker';
import {Download, Upload} from '@tamagui/lucide-icons';
import {useToast} from "@/components/common/ToastProvider";


export default function Backup({ route,  navigation }: RootScreenProps<'Backup'>) {
  const { showToast } = useToast();
  const { t } = useTranslation(['main']);
  const exportFile = async () => {
    const sizeData = sizeStats.getAllKeys();
    const doc = {data: {}};
    for(const k of sizeData) {
      (doc.data as any)[k] = sizeStats.getNumber(k);
    }

    const fileName = 'nlpa-data.json';
    const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    try {
      await RNFS.writeFile(filePath, JSON.stringify(doc), 'utf8');
      showToast('Exported to ' + filePath, 'success');
    } catch (err) {
      showToast('Export failed.', 'error');
      console.error('Export failed:', err);
    }
  }
  const importData = async () => {
    try {
      const res = await pick({
        type: [types.json],
      });

      if (!res || !res[0].uri) {
        showToast('No file selected.', 'error');
        return;
      }

      const fileContent = await RNFS.readFile(res[0].uri, 'utf8');
      try {
        const { data } = JSON.parse(fileContent);
        for(const s of Object.keys(data)) {
          sizeStats.set(s, data[s] as number);
        }
        showToast('Import successful.', 'success');
      } catch (err) {
        showToast('Import failed.', 'error');
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('Import failed.', 'error');
      return null;
    }
  };

  return (
    <Screen title={t('main:backup')} subtitle={t('main:backup_description')}>
      <YStack gap={20} flex={1}>
        <XStack gap={12}>
          <TButton
            flex={1}
            backgroundColor="$btnBackground"
            onPress={exportFile}
            borderRadius={12}
          >
            <XStack alignItems="center" gap={10}>
              <Download size={20} color="$color0" />
              <TText color="$color0">
                {t('main:backup_export')}
              </TText>
            </XStack>
          </TButton>
          <TButton
            flex={1}
            backgroundColor="$btnBackground"
            onPress={importData}
            borderRadius={12}
          >
            <XStack alignItems="center" gap={10}>
              <Upload size={20} color="$color0" />
              <TText color="$color0">
                {t('main:backup_import')}
              </TText>
            </XStack>
          </TButton>
        </XStack>
      </YStack>
    </Screen>
  );

}
