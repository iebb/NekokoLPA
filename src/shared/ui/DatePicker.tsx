import React, {useMemo, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {ChevronLeft, ChevronRight} from '@tamagui/lucide-icons';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';

/** Monday-first weekday index (0 = Monday) for a given Date. */
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Localised short weekday labels, Monday first. */
function useWeekdayLabels(locale?: string): string[] {
  return useMemo(() => {
    // 2024-01-01 was a Monday, so this walks Mon..Sun.
    return Array.from({length: 7}, (_, i) =>
      new Date(2024, 0, 1 + i).toLocaleDateString(locale, {weekday: 'narrow'}),
    );
  }, [locale]);
}

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  /** BCP-47 tag; defaults to the device locale. */
  locale?: string;
}

/**
 * Compact month-grid date picker built from Tamagui primitives.
 *
 * Replaces @react-native-community/datetimepicker: the values it feeds are
 * day-granular expiry tags, so a full native date/time spinner was more
 * machinery than the data needs, and the native module has no macOS support.
 * A grid also avoids nesting a scrollable or a second Sheet inside the
 * already-open AppSheet, which is where a Select-based version gets fragile.
 */
export default function DatePicker({value, onChange, locale}: DatePickerProps) {
  const theme = useTheme();
  const weekdays = useWeekdayLabels(locale);

  // Which month the grid is showing; independent of the selected day so the
  // user can page through months without changing their selection.
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const cells = useMemo(() => {
    const leading = mondayFirstWeekday(new Date(year, month, 1));
    const total = daysInMonth(year, month);
    const result: (number | null)[] = Array(leading).fill(null);
    for (let day = 1; day <= total; day++) {
      result.push(day);
    }
    // Pad to whole weeks so the grid keeps a stable shape.
    while (result.length % 7 !== 0) {
      result.push(null);
    }
    return result;
  }, [year, month]);

  const shiftMonth = (delta: number) => {
    setVisibleMonth(new Date(year, month + delta, 1));
  };

  const selectDay = (day: number) => {
    // Preserve the time-of-day of the incoming value.
    const next = new Date(value);
    next.setFullYear(year, month, day);
    onChange(next);
  };

  const monthLabel = visibleMonth.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <YStack gap={8}>
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={4}>
        <TouchableOpacity
          onPress={() => shiftMonth(-1)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityRole="button"
          accessibilityLabel="Previous month">
          <ChevronLeft size={20} color={theme.textDefault?.val} />
        </TouchableOpacity>
        <TText color="$textDefault" fontSize={15} fontWeight="600">
          {monthLabel}
        </TText>
        <TouchableOpacity
          onPress={() => shiftMonth(1)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityRole="button"
          accessibilityLabel="Next month">
          <ChevronRight size={20} color={theme.textDefault?.val} />
        </TouchableOpacity>
      </XStack>

      <XStack>
        {weekdays.map((label, i) => (
          <YStack key={i} flex={1} alignItems="center">
            <TText color="$color6" fontSize={11} fontWeight="600">
              {label}
            </TText>
          </YStack>
        ))}
      </XStack>

      <YStack gap={2}>
        {Array.from({length: cells.length / 7}, (_, week) => (
          <XStack key={week}>
            {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
              if (day === null) {
                return <YStack key={i} flex={1} height={36} />;
              }
              const selected = isSameDay(new Date(year, month, day), value);
              return (
                <YStack key={i} flex={1} alignItems="center">
                  <TouchableOpacity
                    onPress={() => selectDay(day)}
                    accessibilityRole="button"
                    accessibilityState={{selected}}>
                    <YStack
                      width={36}
                      height={36}
                      borderRadius={18}
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor={selected ? '$primaryColor' : 'transparent'}>
                      <TText
                        fontSize={14}
                        fontWeight={selected ? '700' : '400'}
                        color={selected ? theme.background?.val : theme.textDefault?.val}>
                        {day}
                      </TText>
                    </YStack>
                  </TouchableOpacity>
                </YStack>
              );
            })}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
