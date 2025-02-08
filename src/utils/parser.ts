import {countries} from "@/data/countryData";
import {ProfileMetadataMap} from "@/native/types";
import {resolveMccMnc} from "@/data/mccMncResolver";
import {TFunction} from "i18next";
import {countryList} from "@/utils/mmkv";
import {Colors} from "react-native-ui-lib";

export function predictCountryForICCID(iccid: string) {
  const prefix = iccid.substring(2).replaceAll(/^0+/g, '');
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

export function parseMetadata(metadata: ProfileMetadataMap, t: TFunction, parseCountry = true) {
  const tags = [];

  let nickname = metadata.profileNickname || metadata.profileName || metadata.serviceProviderName;
  if (nickname) {

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
            color: Colors.red10,
            backgroundColor: Colors.red70,
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
            color: days < 7 ? Colors.orange10 : Colors.green10,
            backgroundColor: days < 7 ? Colors.orange70 : Colors.green70,
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
      color: Colors.blue10,
      backgroundColor: Colors.blue70,
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
  };

}

export function parseMetadataOnly(metadata: ProfileMetadataMap) {
  const tags = [];

  let nickname = metadata.profileNickname || metadata.profileName || metadata.serviceProviderName;
  if (nickname) {

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
  };

}