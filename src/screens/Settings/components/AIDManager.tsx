import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {Button as TButton, Input, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
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
} from '@/utils/aid';

export default function AIDManager() {
  const theme = useTheme();
  const [aids, setAids] = useState<string[]>(() => getAIDList().split(',').filter(Boolean));
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

  return (
    <YStack flex={1}>
      <YStack flex={1} padding={0} gap={16}>
        <XStack alignItems="flex-end" gap={10}>
          <YStack flex={1}>
            <TText color="$color10" fontSize={12} marginBottom={6}>
              Add AID (hex)
            </TText>
            <Input
              placeholder="Add AID (hex)"
              value={input}
              onChangeText={setInput}
              autoCapitalize="characters"
              borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
              backgroundColor="transparent"
              color={theme.textDefault?.val}
              placeholderTextColor={theme.color10?.val || '#999'}
            />
          </YStack>
          <TButton
            onPress={addAid}
            disabled={!inputValid}
            backgroundColor={inputValid ? "$accentColor" : "$color2"}
          >
            <TText>
              Add
            </TText>
          </TButton>
        </XStack>

        {aids.length > 0 ? (
          <DraggableFlatList
            data={aids}
            keyExtractor={(item: string) => item}
            keyboardShouldPersistTaps="handled"
            onDragEnd={({ data }: { data: string[] }) => setAids(data)}
            renderItem={({ item, drag, isActive }: any) => (
              <TouchableOpacity activeOpacity={1} onLongPress={drag} disabled={isActive} style={[{ opacity: isActive ?  0.8 : 1 }]}>
                <XStack alignItems="center" paddingVertical={10} paddingHorizontal={12} gap={10}>
                  <TText flex={1} color="$textDefault" fontSize={14} numberOfLines={1} style={{ fontFamily: 'monospace' }}>{item}</TText>
                  <TButton onPress={() => removeAid(item)} height={28} minWidth={28} backgroundColor="$backgroundDangerHeavy" borderWidth={0}>
                    <FontAwesomeIcon icon={faTrash} style={{ color: theme.background?.val || '#fff' }} />
                  </TButton>
                </XStack>
              </TouchableOpacity>
            )}
          />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" minHeight={100}>
            <TText color="$color10" fontSize={14}>No AIDs configured</TText>
          </YStack>
        )}
      </YStack>

      <YStack padding={20} borderTopWidth={0.5} borderTopColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'} gap={8}>
      <XStack justifyContent="flex-end" gap={8}>
          <TButton
            onPress={onResetPreset}
            size="$3"
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              Preset
            </TText>
          </TButton>
          <TButton
            onPress={onGsmaOnly}
            size="$3"
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              GSMA
            </TText>
          </TButton>
          <TButton
            onPress={onEstkSe0}
            size="$3"
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              ESTK-0
            </TText>
          </TButton>
          <TButton
            onPress={onEstkSe1}
            size="$3"
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              ESTK-1
            </TText>
          </TButton>
        </XStack>
      </YStack>
    </YStack>
  );
}


