import {countries} from "@/data/countryData";
import {ProfileMetadataMap} from "@/native/types";
import {resolveMccMnc} from "@/data/mccMncResolver";
import {TFunction} from "i18next";
import {countryList} from "@/utils/mmkv";
// Color constants for tag rendering - using theme-agnostic values
const TAG_COLORS = {
  red: { fg: '#dc2626', bg: '#fee2e2' },
  orange: { fg: '#ea580c', bg: '#ffedd5' },
  green: { fg: '#16a34a', bg: '#dcfce7' },
  blue: { fg: '#2563eb', bg: '#dbeafe' },
};

export function predictCountryForICCID(iccid: string) {
  const prefix = (iccid && iccid.length > 2) ? iccid.substring(2).replaceAll(/^0+/g, '') : '';
  for (let i = 1; i <= 3; i++) {
    if (countries['+' + prefix.substring(0, i)]) {
      return countries['+' + prefix.substring(0, i)];
    }
  }
  return {name: 'United States', dial_code: '+1', emoji: '🇺🇸', code: 'US'}
}

function emojiToCountryCode(emoji: string) {
  // Extract the two regional indicator symbols from the emoji
  const codePoints = [...emoji].map(char => char.codePointAt(0));

  // Convert them to ISO country code (subtract 0x1F1E6 which is the base for 'A')
  const countryCode = codePoints
    .map(cp => String.fromCharCode(cp! - 0x1F1E6 + 65))
    .join('');

  return countryCode.toUpperCase();
}


export interface Tag {
  tag: string;
  value: string;
  rawValue: string;
  color: string;
  backgroundColor: string;
}

export function dateToDate8(d: Date): string {
  return d.toISOString().split('T')[0].replace(/-/g,"");
}

export function dateToDate6(d: Date): string {
  return dateToDate8(d).substring(2);
}

/**
 * Parse a 3-letter lowercase suffix (base-26) to a number
 * 'aaa' = 0, 'aab' = 1, ..., 'zzz' = 17575
 */
function parseBase26Suffix(suffix: string): number {
  if (suffix.length !== 3 || !/^[a-z]{3}$/.test(suffix)) {
    return -1; // No order set
  }
  const a = suffix.charCodeAt(0) - 97; // 'a' = 97
  const b = suffix.charCodeAt(1) - 97;
  const c = suffix.charCodeAt(2) - 97;
  return a * 26 * 26 + b * 26 + c;
}

/**
 * Convert a number to a 3-letter lowercase suffix (base-26)
 * 0 = 'aaa', 1 = 'aab', ..., 17575 = 'zzz'
 */
export function orderToBase26Suffix(order: number): string {
  if (order < 0 || order > 17575) {
    return 'mmm'; // Default
  }
  const c = order % 26;
  const b = Math.floor((order / 26) % 26);
  const a = Math.floor(order / (26 * 26));
  return String.fromCharCode(97 + a) + String.fromCharCode(97 + b) + String.fromCharCode(97 + c);
}

export function parseMetadata(metadata: ProfileMetadataMap, t: TFunction, parseCountry = true) {
  const tags = [];

  let nickname = metadata.profileNickname || metadata.profileName || metadata.serviceProviderName;
  let order = -1; // Default order for 'mmm'

  if (nickname) {
    // Extract and parse order suffix (^ followed by 3 lowercase letters at the end, e.g., "^xyz")
      const orderSuffixMatch = nickname.match(/\^[a-z]{3}$/);
      if (orderSuffixMatch && orderSuffixMatch[0]) {
        const suffix = orderSuffixMatch[0].substring(1); // Remove the '^' and get the 3 letters
      order = parseBase26Suffix(suffix);
      // Remove the suffix from the nickname (^ + 3 letters = 4 characters)
      nickname = nickname.slice(0, -4).trim();
    }

    const eDates = nickname.matchAll(/\s*d:(2[012])?(\d\d)(\d\d)(\d\d)/g);
    for(const eDate of eDates) {
      if (eDate && eDate.length > 1) {
        const year = new Date().getUTCFullYear();
        const twoDigitYear = new Date().getUTCFullYear() % 100;
        const century = year - twoDigitYear;
        const inputYear = Number(eDate[2]);
        const resultYear = (eDate[1] ? Number(eDate[1]) * 100 : century) + inputYear;
        const d = new Date((+new Date(`${resultYear}-${eDate[3]}-${eDate[4]}`)) - new Date().getTimezoneOffset() * 1000 * 60);

        const days = Math.floor((+d - (+new Date())) / 86400000);
        const date8 = d.toISOString().split('T')[0].replace(/-/g,"");
        const date6 = date8.substring(2);
        if (days < 0) {
          tags.push({
            tag: 'date',
            // @ts-ignore
            value: t('main:profile_date_past', {
              date: date8,
              remaining: -days,
            }) as string,
            rawValue: `d:${date6}`,
            color: TAG_COLORS.red.fg,
            backgroundColor: TAG_COLORS.red.bg,
          })
        } else {
          tags.push({
            tag: 'date',
            // @ts-ignore
            value: t('main:profile_date_remaining', {
              date: date8,
              remaining: days,
            }) as string,
            rawValue: `d:${date6}`,
            color: days < 7 ? TAG_COLORS.orange.fg : TAG_COLORS.green.fg,
            backgroundColor: days < 7 ? TAG_COLORS.orange.bg : TAG_COLORS.green.bg,
          })
        }
        nickname = nickname.replace(eDate[0], '').trim();
      }
    }
  }


  const it = nickname.matchAll(/\s*t:(\S+)/g);
  for(const match of it) {
    tags.push({
      tag: 'text',
      value: match[1].replaceAll("_", " "),
      rawValue: `t:${match[1]}`,
      color: TAG_COLORS.blue.fg,
      backgroundColor: TAG_COLORS.blue.bg,
    });
    nickname = nickname.replace(match[0], '').trim();
  }

  let mccMncInfo = resolveMccMnc(metadata.profileOwnerMccMnc);

  let lastValue: {[key: string]: string} = {};
  try {
    if (mccMncInfo.MCC) {
      lastValue = JSON.parse(countryList.getString(mccMncInfo.MCC) || '{}') as {[key: string]: string};
      lastValue[metadata.profileOwnerMccMnc] = mccMncInfo.Operator || metadata.serviceProviderName || metadata.profileOwnerMccMnc;
      countryList.set(mccMncInfo.MCC, JSON.stringify(lastValue));
    }
  } finally {
  }

  let countryEmoji = mccMncInfo.ISO1 ?? predictCountryForICCID(metadata.iccid).code;
  let countryMatch = nickname.match(/[🇦-🇿]{2}/u);
  if (countryMatch) {
    countryEmoji = emojiToCountryCode(countryMatch[0]);
    if (parseCountry) {
      nickname = nickname.replace(countryMatch[0], "").trim();
    }
  }

  return {
    name: nickname,
    tags: tags,
    country: countryEmoji,
    mccMnc: mccMncInfo,
    order: order,
  };

}

export function parseMetadataOnly(metadata: ProfileMetadataMap) {
  const tags = [];

  let nickname = metadata.profileNickname || metadata.profileName || metadata.serviceProviderName;
  let order = -1; // Default order for 'mmm'

  if (nickname) {
    // Extract and parse order suffix (^ followed by 3 lowercase letters at the end, e.g., "^xyz")
      const orderSuffixMatch = nickname.match(/\^[a-z]{3}$/);
      if (orderSuffixMatch && orderSuffixMatch[0]) {
        const suffix = orderSuffixMatch[0].substring(1); // Remove the '^' and get the 3 letters
      order = parseBase26Suffix(suffix);
      // Remove the suffix from the nickname (^ + 3 letters = 4 characters)
      nickname = nickname.slice(0, -4).trim();
    }

    const eDates = nickname.matchAll(/\s*d:(2[012])?(\d\d)(\d\d)(\d\d)/g);
    for(const eDate of eDates) {
      if (eDate && eDate.length > 1) {
        nickname = nickname.replace(eDate[0], '').trim();
      }
    }
  }


  const it = nickname.matchAll(/\s*t:(\S+)/g);
  for(const match of it) {
    tags.push({
      tag: 'text',
      value: match[1].replaceAll("_", " "),
      rawValue: `t:${match[1]}`,
    });
    nickname = nickname.replace(match[0], '').trim();
  }

  let mccMncInfo = resolveMccMnc(metadata.profileOwnerMccMnc);

  let lastValue: {[key: string]: string} = {};
  try {
    if (mccMncInfo.MCC) {
      lastValue = JSON.parse(countryList.getString(mccMncInfo.MCC) || '{}') as {[key: string]: string};
      lastValue[metadata.profileOwnerMccMnc] = mccMncInfo.Operator || metadata.serviceProviderName || metadata.profileOwnerMccMnc;
      countryList.set(mccMncInfo.MCC, JSON.stringify(lastValue));
    }
  } finally {
  }

  let countryEmoji = mccMncInfo.ISO1 ?? predictCountryForICCID(metadata.iccid).code;
  let countryMatch = nickname.match(/[🇦-🇿]{2}/u);
  if (countryMatch) {
    countryEmoji = emojiToCountryCode(countryMatch[0]);
    nickname = nickname.replace(countryMatch[0], "").trim();
  }

  return {
    name: nickname,
    tags: tags,
    country: countryEmoji,
    mccMnc: mccMncInfo,
    order: order,
  };

}
