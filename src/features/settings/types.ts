import type {ComponentType} from 'react';

/** Icon components come from @tamagui/lucide-icons and share this call shape. */
export type SettingIcon = ComponentType<{size?: number; color?: string}>;

/** Which editor a settings row renders. */
export type SettingKind = 'select' | 'color' | 'aid';

/** Declarative description of one row in the settings screen. */
export interface SettingRow {
  /** Preference key, also used to look up i18n strings. */
  key: string;
  type: SettingKind;
  icon: SettingIcon;
  options?: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
  /** Row is only meaningful on Android (e.g. OMAPI-specific toggles). */
  androidOnly?: boolean;
}
