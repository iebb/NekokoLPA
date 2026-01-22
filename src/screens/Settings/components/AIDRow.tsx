import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Text as TText, useTheme, XStack, YStack } from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import {
  ESTK_SE0_LIST,
  ESTK_SE1_LIST,
  getAIDList,
  GSMA_AID,
  PRESET_AID_LIST,
  resetAIDsToPreset,
  setAIDList,
  setAIDsToEstkSe0,
  setAIDsToEstkSe1,
  setAIDsToGsmaOnly
} from "@/utils/aid";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Trash2, ChevronRight } from "@tamagui/lucide-icons";

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  icon: any;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}

const AIDRow = React.memo(function AIDRow({ row }: { row: SettingDataType }) {
  const { t } = useTranslation(['main']);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const aidList = getAIDList();
  const aidCount = aidList.split(',').filter(Boolean).length;

  const [aids, setAids] = useState<string[]>(() => aidList.split(',').filter(Boolean));
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    if (aids.length > 0) setAIDList(aids.join(','));
  }, [aids]);

  const addAid = () => {
    const v = input.trim().toUpperCase();
    if (!v || !/^[0-9A-F]+$/.test(v) || aids.includes(v)) return;
    setAids([...aids, v]);
    setInput('');
  };

  const removeAid = (aid: string) => setAids(aids.filter(a => a !== aid));
  const onResetPreset = () => { resetAIDsToPreset(); setAids(PRESET_AID_LIST.split(',').filter(Boolean)); };
  const onGsmaOnly = () => { setAIDsToGsmaOnly(); setAids([GSMA_AID]); };
  const onEstkSe0 = () => { setAIDsToEstkSe0(); setAids(ESTK_SE0_LIST.split(',').filter(Boolean)); };
  const onEstkSe1 = () => { setAIDsToEstkSe1(); setAids(ESTK_SE1_LIST.split(',').filter(Boolean)); };

  const inputValid = /^[0-9A-F]+$/.test(input.trim().toUpperCase()) && !aids.includes(input.trim().toUpperCase());

  const Icon = row.icon;

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => setOpen(true)}>
      <XStack alignItems="center" gap={16}>
        <YStack
          padding={8}
          borderRadius={10}
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$primaryColor" borderRadius={10} opacity={0.15} />
          <Icon size={20} color={theme.primaryColor?.val} />
        </YStack>

        <YStack flex={1}>
          <TText color="$textDefault" fontSize={16} fontWeight="500">
            {t(`main:settings_title_${row.key}`)}
          </TText>
          <TText color="$color6" fontSize={13}>
            {aidCount} AID{aidCount !== 1 ? 's' : ''} configured
          </TText>
        </YStack>

        <ChevronRight size={18} color="$color6" />
      </XStack>

      {open && (
        <AppSheet open={open} onOpenChange={setOpen} title={t(`main:settings_title_${row.key}`)}>
          <YStack flex={1} paddingBottom={Platform.OS === 'ios' ? 20 : 0}>
            {/* Input Section */}
            <YStack gap={8} marginBottom={16}>
              <TText color="$color6" fontSize={13} marginLeft={4}>Add New AID</TText>
              <XStack gap={10}>
                <Input
                  flex={1}
                  placeholder="A000000..."
                  value={input}
                  onChangeText={setInput}
                  autoCapitalize="characters"
                  borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                  backgroundColor="transparent"
                  color={theme.textDefault?.val}
                  placeholderTextColor={theme.color6?.val || '#999'}
                  height={44}
                  borderRadius={12}
                />
                <Button
                  onPress={addAid}
                  disabled={!inputValid}
                  backgroundColor="$primaryColor"
                  height={44}
                  borderRadius={12}
                  paddingHorizontal={20}
                  opacity={inputValid ? 1 : 0.5}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <TText color="$background" fontWeight="600">
                    Add
                  </TText>
                </Button>
              </XStack>
            </YStack>

            {/* List Section */}
            <YStack flex={1} minHeight={300} marginBottom={16}>
              {aids.length > 0 ? (
                <DraggableFlatList
                  data={aids}
                  keyExtractor={(item: string) => item}
                  keyboardShouldPersistTaps="handled"
                  onDragEnd={({ data }: { data: string[] }) => setAids(data)}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item, drag, isActive }: any) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      onLongPress={drag}
                      disabled={isActive}
                      style={{ marginBottom: 8 }}
                    >
                      <XStack
                        alignItems="center"
                        paddingVertical={12}
                        paddingHorizontal={16}
                        gap={12}
                        backgroundColor={isActive ? "$color4" : "$surfaceSpecial"}
                        borderRadius={12}
                        borderWidth={1}
                        borderColor="$borderColor"
                        opacity={isActive ? 0.9 : 1}
                      >
                        <TText
                          flex={1}
                          color="$textDefault"
                          fontSize={15}
                          style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}
                        >
                          {item}
                        </TText>
                        <TouchableOpacity onPress={drag} style={{ opacity: 0.5 }}>
                          {/* Add Grip icon if imported, or just use drag capability */}
                        </TouchableOpacity>
                        <Button
                          onPress={() => removeAid(item)}
                          size="$2"
                          backgroundColor="transparent"
                          padding={8}
                          circular
                        >
                          <Trash2 size={18} color={theme.colorError?.val || '#ff4d4d'} />
                        </Button>
                      </XStack>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$color2" borderRadius={12} borderStyle="dashed" borderWidth={1} borderColor="$color6">
                  <TText color="$color6" fontSize={14}>No AIDs configured</TText>
                  <TText color="$color8" fontSize={12} marginTop={4}>Add one or use a preset</TText>
                </YStack>
              )}
            </YStack>

            {/* Presets Section */}
            <YStack gap={10}>
              <TText color="$color6" fontSize={13} marginLeft={4}>Quick Presets</TText>
              <XStack flexWrap="wrap" gap={8}>
                {[
                  { label: "Default", onPress: onResetPreset },
                  { label: "GSMA Only", onPress: onGsmaOnly },
                  { label: "eSTK (00)", onPress: onEstkSe0 },
                  { label: "eSTK (01)", onPress: onEstkSe1 },
                ].map((preset, i) => (
                  <Button
                    key={i}
                    onPress={preset.onPress}
                    backgroundColor="transparent"
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius={10}
                    height={36}
                    paddingHorizontal={12}
                  >
                    <TText fontSize={13} color="$textDefault">{preset.label}</TText>
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>
        </AppSheet>
      )}
    </TouchableOpacity>
  );
});

export default AIDRow;
