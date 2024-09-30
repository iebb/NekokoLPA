import {countries} from "@/components/MainUI/ProfileList/countryData";
import {ProfileMetadataMap} from "@/native/types";
import {resolveMccMnc, T_PLMN} from "@/data/mccMncResolver";
import {TFunction} from "i18next";
import {countryList} from "@/storage/mmkv";

export function predictCountryForICCID(iccid: string) {
  const prefix = iccid.substring(2).replaceAll(/^0+/g, '');
  for (let i = 1; i <= 3; i++) {
    if (countries['+' + prefix.substring(0, i)]) {
      return countries['+' + prefix.substring(0, i)];
    }
  }
  return {name: 'United States', dial_code: '+1', emoji: '🇺🇸', code: 'US'}
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

export function parseMetadata(metadata: ProfileMetadataMap, colors: any, t: TFunction) {
  const tags = [];
  let nickname = metadata.NICKNAME ?? metadata.PROVIDER_NAME ?? metadata.NAME;
  if (nickname) {

    const eDates = nickname.matchAll(/\s*d:(2[012])?(\d\d)(\d\d)(\d\d)/g);
    for(const eDate of eDates) {
      if (eDate && eDate.length > 1) {
        const year = new Date().getUTCFullYear();
        const twoDigitYear = new Date().getUTCFullYear() % 100;
        const century = year - twoDigitYear;
        const inputYear = Number(eDate[2]);
        const resultYear = (eDate[1] ? Number(eDate[1]) * 100 : century) + inputYear;
        const d = new Date(`${resultYear}-${eDate[3]}-${eDate[4]}`);

        const days = Math.floor((+d - (+new Date())) / 86400000);
        const date8 = d.toISOString().split('T')[0].replace(/-/g,"");
        const date6 = date8.substring(2);
        if (days) {
          if (days < 0) {
            tags.push({
              tag: 'date',
              // @ts-ignore
              value: t('profile:date_past', {
                date: date8,
                remaining: -days,
              }) as string,
              rawValue: `d:${date6}`,
              color: colors.red700,
              backgroundColor: colors.red100,
            })
          } else {
            tags.push({
              tag: 'date',
              // @ts-ignore
              value: t('profile:date_remaining', {
                date: date8,
                remaining: days,
              }) as string,
              rawValue: `d:${date6}`,
              color: days < 7 ? colors.orange700 : colors.green700,
              backgroundColor: days < 7 ? colors.orange100 : colors.green100,
            })
          }
          nickname = nickname.replace(eDate[0], '').trim();
        }
      }
    }
  }


  const it = nickname.matchAll(/\s*t:(\S+)/g);
  for(const match of it) {
    tags.push({
      tag: 'text',
      value: match[1].replaceAll("_", " "),
      rawValue: `t:${match[1]}`,
      color: colors.blue700,
      backgroundColor: colors.blue100,
    });
    nickname = nickname.replace(match[0], '').trim();
  }

  let mccMncInfo = resolveMccMnc(metadata.uMCC_MNC);

  let lastValue: {[key: string]: string} = {};
  try {
    lastValue = JSON.parse(countryList.getString(mccMncInfo.MCC) || '{}') as {[key: string]: string};
  } finally {
  }

  lastValue[metadata.uMCC_MNC] = mccMncInfo.Operator || metadata.PROVIDER_NAME || metadata.uMCC_MNC;
  countryList.set(mccMncInfo.MCC, JSON.stringify(lastValue));

  let countryEmoji = mccMncInfo.ISO1 ?? predictCountryForICCID(metadata.uICCID).code;
  let countryMatch = nickname.match(/[🇦-🇿]{2}/u);
  if (countryMatch) {
    countryEmoji = countryMatch[0];
    nickname = nickname.replace(countryMatch[0], "").trim();
  }

  return {
    name: nickname,
    tags: tags,
    country: countryEmoji,
    mccMnc: mccMncInfo,
  };

}