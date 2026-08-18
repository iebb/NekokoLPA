/// <reference types="jest" />
import {iconUrl, parseOperatorCatalog, splitPlmn} from '../operatorCatalog';

// A verbatim excerpt of catalog/706.toml, including the nested gid tables that
// follow an operator and the second operator after them.
const SAMPLE = `mcc = "706"
country = "El Salvador"
iso = "SV"
region = "South and Central America"

[[operators]]
mnc = "03"
plmn = "70603"
operator = "Telemovil El Salvador S.A."
brand = "Tigo"
tadig = "SLVTM"
icon = "tigo"
icon_scope = "706"

[[operators.gids]]
gid1 = ""
gid2 = ""
profile_provider_names = ["TIGO", "Tigo"]
profile_names = ["eSIM 5.8", "Tigo"]

[[operators]]
mnc = "05"
plmn = "70605"
operator = "Vodafone"
brand = "Vodafone"
icon = "vodafone"
icon_scope = "worldwide"
`;

describe('operator catalog', () => {
  it('reads operators keyed by PLMN', () => {
    const catalog = parseOperatorCatalog(SAMPLE);
    expect(Object.keys(catalog).sort()).toEqual(['70603', '70605']);
    expect(catalog['70603']).toEqual({icon: 'tigo', scope: '706', brand: 'Tigo'});
  });

  it('does not let a nested gid table overwrite its operator', () => {
    // the gid tables carry their own keys and sit between two operators
    const catalog = parseOperatorCatalog(SAMPLE);
    expect(catalog['70603'].icon).toBe('tigo');
    expect(catalog['70605'].icon).toBe('vodafone');
  });

  it('resolves both icon scopes', () => {
    const catalog = parseOperatorCatalog(SAMPLE);
    expect(iconUrl(catalog['70603'])).toMatch(/\/icons\/706\/tigo\.png$/);
    expect(iconUrl(catalog['70605'])).toMatch(/\/icons\/worldwide\/vodafone\.png$/);
  });

  it('ignores an entry with no icon', () => {
    expect(parseOperatorCatalog('[[operators]]\nplmn = "20201"\n')).toEqual({});
  });

  it('splits a PLMN into MCC and the whole key', () => {
    expect(splitPlmn('70603')).toEqual({mcc: '706', plmn: '70603'});
    expect(splitPlmn('310260')).toEqual({mcc: '310', plmn: '310260'});
    expect(splitPlmn('7060')).toBeNull();
    expect(splitPlmn(undefined)).toBeNull();
    expect(splitPlmn('')).toBeNull();
  });
});
