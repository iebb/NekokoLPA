import requests
import json
import os

mcc_mnc_url = "https://mcc-mnc.net/mcc-mnc.csv"
response = requests.get(mcc_mnc_url).text

flag_ts_file = ""


mccs = {}
plmns = {}

flags = {}

rows = response.split("\r\n")
header = rows[0].split(";")
for r in rows[1:]:
    obj = {x:y for x, y in zip(header, r.split(";"))}
    if obj['ISO'] == 'XX':
        obj['ISO'] = 'UN'
    obj['ISO1'] = obj['ISO'].split("/")[0]
    c1 = 0x1F1E6 - 0x41 + ord(obj['ISO1'][0])
    c2 = 0x1F1E6 - 0x41 + ord(obj['ISO1'][1])
    obj['Emoji'] = chr(c1) + chr(c2)
    print(obj['ISO1'])
    # try:
    #     if not os.path.isfile("assets/flags/%s.svg" % obj['ISO1']):
    #         flag_file = requests.get("https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/%x-%x.svg" % (c1, c2))
    #         open("assets/flags/%s.svg" % obj['ISO1'], "wb+").write(flag_file.content)
    #     flags[obj['ISO1']] = "assets/flags/%s.svg" % obj['ISO1']
    # except:
    #     pass
    mccs[obj['MCC']] = {
        "MCC": obj['MCC'],
        "Region": obj['Region'],
        "Country": obj['Country'],
        "ISO1": obj['ISO1'],
        "ISO": obj['ISO'],
        "Emoji": obj['Emoji'],
    }
    if obj['PLMN'] in plmns:
        continue
    plmns[obj['PLMN']] = obj

open("src/data/mcc.json", "w+").write(json.dumps(mccs, indent=2))
open("src/data/plmn.json", "w+").write(json.dumps(plmns, indent=2))

# flag_ts_file = open("src/assets/flags.ts", "w+")
# flag_ts_file.write("export const Flags = {\n")
# for flag in flags:
#     flag_ts_file.write(f'  {flag}: require("@/../assets/flags/{flag}.svg"),\n')
# flag_ts_file.write("}\n")
