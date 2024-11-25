import {MMKV} from "react-native-mmkv";

export const cps = new MMKV({id: 'cached_provider_search'});

export async function getUri(ss: string) {
  try {
    const cmp = ss;

    var cached = cps.getString(cmp);
    if (cached) {
      return cached;
    } else {
      console.log("cached miss from cmp", cmp);
    }

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cmp)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        "Referer": "https://duckduckgo.com/",
      }
    });


    if (response.ok) {
      const data = await response.text();
      const results = [...data.matchAll(/<img .+\s+src="([^"]+)" name="i15" \/>/g)];
      console.log(results);
      for(const row in results) {
        if (!(results[row][1].includes("wikipedia"))) {
          console.log("using", results[row][1]);
          val = "https:" + results[row][1];
          cps.set(cmp, val);
          return val;
        }
      }
      return null;
    } else {

      console.error('Error fetching data:', response.status);
      return null;
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}