/**
 * The operator icon catalog at github.com/NekokoLPA/operator-icons.
 *
 * Most profiles carry no icon of their own: SGP.22 has a place for one
 * (tags 93/94) and card issuers rarely fill it, so a list of profiles from a
 * real card is a list of unmarked rows. What every profile does carry is the
 * operator's PLMN, and the catalog maps that to a logo.
 *
 * Its layout, from the repository's README:
 *
 *     catalog/<mcc>.toml        operators of one country, keyed by PLMN
 *     icons/<mcc>/<name>.png    an icon used in one country
 *     icons/worldwide/<name>.png  an icon shared across countries
 *
 * An entry names its icon by stem plus a scope, so `icon = "vodafone"` with
 * `icon_scope = "worldwide"` resolves to `icons/worldwide/vodafone.png`.
 *
 * This module is the pure half — parsing and URL building — and is free of
 * React Native imports so it can be unit tested. Fetching and caching live in
 * `useOperatorIcon`.
 */

/**
 * jsDelivr serves the repository straight from a tag or branch and caches at
 * the edge, so no infrastructure of ours sits in front of the icons.
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/NekokoLPA/operator-icons@master';

/** One operator, reduced to what a row needs. */
export interface OperatorEntry {
  /** Icon filename stem. */
  icon: string;
  /** Directory the stem lives in: an MCC, or "worldwide". */
  scope: string;
  /** Short operator name, e.g. "Vodafone". */
  brand?: string;
}

/** Where a country's catalog is fetched from. */
export function catalogUrl(mcc: string): string {
  return `${CDN_BASE}/catalog/${mcc}.toml`;
}

/** Where an entry's icon is fetched from. */
export function iconUrl(entry: OperatorEntry): string {
  return `${CDN_BASE}/icons/${entry.scope}/${entry.icon}.png`;
}

/**
 * Splits a PLMN into its MCC and MNC.
 *
 * The MCC is always three digits and the MNC is the two or three that follow,
 * which is why the catalog is filed by MCC and looked up by the whole string.
 */
export function splitPlmn(plmn: string | undefined): {mcc: string; plmn: string} | null {
  const digits = (plmn ?? '').replace(/\D/g, '');
  if (digits.length < 5 || digits.length > 6) {
    return null;
  }
  return {mcc: digits.slice(0, 3), plmn: digits};
}

/**
 * Reads one `catalog/<mcc>.toml` into a PLMN-keyed map.
 *
 * Deliberately not a general TOML parser: the catalog's shape is fixed and
 * checked by the repository's own CI, so this reads exactly that shape and
 * ignores everything else. The one structure that must not be ignored is
 * `[[operators.gids]]` — those nested tables sit inside an operator and carry
 * keys of their own, and folding them into the operator would let a later
 * table overwrite the icon that was already read.
 */
export function parseOperatorCatalog(toml: string): Record<string, OperatorEntry> {
  const operators: Record<string, OperatorEntry> = {};

  let current: Record<string, string> | null = null;
  let insideOperator = false;

  const flush = () => {
    if (current?.plmn && current.icon) {
      operators[current.plmn] = {
        icon: current.icon,
        scope: current.icon_scope || current.plmn.slice(0, 3),
        brand: current.brand || current.operator,
      };
    }
    current = null;
  };

  for (const raw of toml.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    if (line === '[[operators]]') {
      flush();
      current = {};
      insideOperator = true;
      continue;
    }
    if (line.startsWith('[')) {
      // Any other table — `[[operators.gids]]` and anything added later —
      // ends the operator's own keys without ending the operator.
      insideOperator = false;
      continue;
    }
    if (!insideOperator || !current) {
      continue;
    }

    const match = /^([A-Za-z_][\w-]*)\s*=\s*"(.*)"$/.exec(line);
    if (match) {
      current[match[1]] = match[2];
    }
  }
  flush();

  return operators;
}
