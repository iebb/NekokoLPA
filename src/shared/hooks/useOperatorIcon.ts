import {useEffect, useState} from 'react';

import {catalogCache} from '@/shared/storage';
import {usePreference} from '@/shared/hooks/usePreference';
import {
  OperatorEntry,
  catalogUrl,
  iconUrl,
  parseOperatorCatalog,
  splitPlmn,
} from '@/shared/utils/operatorCatalog';

/**
 * The operator's logo for a profile, from the icon catalog.
 *
 * A profile's own icon (SGP.22 tags 93/94) is preferred wherever a card
 * carries one, but most do not — a real card's profile list is a list of
 * unmarked rows, with the operator identified only by a PLMN. This resolves
 * that PLMN through the catalog described in `operatorCatalog`.
 *
 * Returns undefined until the country's catalog has been read, and whenever
 * there is no entry for the operator, so a row simply stays as it was rather
 * than reserving space for an icon that may never arrive.
 */

/** How long a country's catalog is used before it is fetched again. */
const CATALOG_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Catalog = Record<string, OperatorEntry>;

/** Catalogs already read this session, keyed by MCC. */
const loaded = new Map<string, Catalog>();

/** Fetches in progress, so twenty rows of one country make one request. */
const inFlight = new Map<string, Promise<Catalog>>();

function cacheKey(mcc: string): string {
  return `catalog:${mcc}`;
}

function readCache(mcc: string): {catalog: Catalog; fetchedAt: number} | null {
  const raw = catalogCache.getString(cacheKey(mcc));
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return {catalog: parsed.catalog ?? {}, fetchedAt: parsed.fetchedAt ?? 0};
  } catch {
    return null;
  }
}

/**
 * Downloads one country's catalog and caches it.
 *
 * A country with no catalog file is cached as an empty one: without that, the
 * lookup for a profile the catalog does not cover would go out to the network
 * again on every render.
 */
async function fetchCatalog(mcc: string): Promise<Catalog> {
  const pending = inFlight.get(mcc);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    let catalog: Catalog = {};
    try {
      const response = await fetch(catalogUrl(mcc));
      if (response.ok) {
        catalog = parseOperatorCatalog(await response.text());
      }
      catalogCache.set(cacheKey(mcc), JSON.stringify({catalog, fetchedAt: Date.now()}));
    } catch {
      // Offline, or the CDN is unreachable. Nothing is cached, so the next
      // lookup tries again rather than remembering a failure as an answer.
    }
    loaded.set(mcc, catalog);
    inFlight.delete(mcc);
    return catalog;
  })();

  inFlight.set(mcc, request);
  return request;
}

/** Serves the catalog from memory or cache, refreshing a stale one behind it. */
async function catalogFor(mcc: string): Promise<Catalog> {
  const memo = loaded.get(mcc);
  if (memo) {
    return memo;
  }

  const cached = readCache(mcc);
  if (cached) {
    loaded.set(mcc, cached.catalog);
    if (Date.now() - cached.fetchedAt > CATALOG_TTL_MS) {
      // Serve what we have and update in the background: an icon a week out
      // of date is better than a row that waits on the network for one.
      void fetchCatalog(mcc);
    }
    return cached.catalog;
  }

  return fetchCatalog(mcc);
}

export function useOperatorIcon(mccMnc: string | undefined): string | undefined {
  const enabled = usePreference('operatorIcons', 'on') === 'on';
  const [uri, setUri] = useState<string>();

  useEffect(() => {
    const key = enabled ? splitPlmn(mccMnc) : null;
    if (!key) {
      setUri(undefined);
      return;
    }

    let cancelled = false;
    void catalogFor(key.mcc).then(catalog => {
      if (!cancelled) {
        const entry = catalog[key.plmn];
        setUri(entry ? iconUrl(entry) : undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mccMnc, enabled]);

  return uri;
}
