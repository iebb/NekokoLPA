import {useEffect, useState} from 'react';

import {preferences} from '@/shared/storage';

/**
 * Reads a preference and re-renders when it changes.
 *
 * Screens previously read preferences once with `useMemo(..., [])`, so a
 * setting changed elsewhere — the header's masking toggle, a dropdown on the
 * settings screen — never reached the list already on screen. It looked like
 * the setting did nothing, when the value had in fact been written and only
 * the next remount would pick it up.
 */
export function usePreference(key: string, fallback: string): string {
  const [value, setValue] = useState(() => preferences.getString(key) ?? fallback);

  useEffect(() => {
    setValue(preferences.getString(key) ?? fallback);
    const listener = preferences.addOnValueChangedListener(changed => {
      if (changed === key) {
        setValue(preferences.getString(key) ?? fallback);
      }
    });
    return () => listener.remove();
  }, [key, fallback]);

  return value;
}
