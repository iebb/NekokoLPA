import {useCallback} from 'react';

import {formatSize} from '@/shared/utils/size';
import {usePreference} from '@/shared/hooks/usePreference';

/**
 * `formatSize`, bound to the current unit setting.
 *
 * `formatSize` already reads the preference on every call, so it was never
 * stale — but nothing re-rendered when the unit changed, so a screen kept
 * showing bytes until it remounted. Subscribing here is what makes the setting
 * visibly take effect.
 */
export function useFormatSize(): (bytes?: number) => string {
  const unit = usePreference('unit', 'b');
  return useCallback((bytes?: number) => formatSize(bytes, unit), [unit]);
}
