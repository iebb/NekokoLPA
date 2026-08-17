import {preferences} from '@/shared/storage';
import {isSimplifiedMode} from '@/shared/config/features';

const numberFormat = Intl.NumberFormat();

/**
 * Formats a byte count in the user's chosen unit.
 *
 * `unitOverride` lets a caller pass the unit it is already subscribed to (see
 * useFormatSize) rather than having this read storage behind React's back —
 * which is what made the setting look inert: the value was always current, but
 * nothing re-rendered when it changed.
 */
export const formatSize = (bytes: number = 0, unitOverride?: string): string => {
  const sizeUnit = isSimplifiedMode()
    ? 'adaptive_si'
    : unitOverride ?? preferences.getString('unit') ?? 'b';
  switch (sizeUnit) {
    case 'b':
      return `${numberFormat.format(bytes)} B`;
    case 'kb':
      return `${numberFormat.format(bytes / 1000)} kB`;
    case 'mb':
      return `${numberFormat.format(bytes / 1000000)} MB`;
    case 'kib':
      return `${numberFormat.format(bytes / 1024)} kiB`;
    case 'mib':
      return `${numberFormat.format(bytes / 1048576)} MiB`;
    case 'adaptive_si':
      if (bytes <= 1.5 * 1000) {
        return `${numberFormat.format(bytes)} B`;
      }
      if (bytes <= 1.5 * 1000000) {
        return `${numberFormat.format(bytes / 1000)} kB`;
      }
      return `${numberFormat.format(bytes / 1000000)} MB`;
    case 'adaptive_bi':
      if (bytes <= 1.5 * 1024) {
        return `${numberFormat.format(bytes)} B`;
      }
      if (bytes <= 1.5 * 1048576) {
        return `${numberFormat.format(bytes / 1024)} kiB`;
      }
      return `${numberFormat.format(bytes / 1048576)} MiB`;
  }
  return `${numberFormat.format(bytes / 1000)} kB`;
};
