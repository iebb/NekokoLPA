import {preferences} from "@/utils/mmkv";

// GSMA default AID
export const GSMA_AID = "A0000005591010FFFFFFFF8900000100";

// Preset AID list (comma separated)
export const PRESET_AID_LIST = [
    "A0000005591010FFFFFFFF8900000100",
    "A0000005591010FFFFFFFF8900050500",
    "A0000005591010000000008900000300",
    "A0000005591010FFFFFFFF8900000177",
].join(",");

export const ESTK_SE0_LIST = [
    "A06573746B6D65FFFF4953442D522030",
    "A0000005591010FFFFFFFF8900000100",
    "A0000005591010FFFFFFFF8900050500",
    "A0000005591010000000008900000300",
    "A0000005591010FFFFFFFF8900000177",
].join(",");

// Preset AID list (comma separated)
export const ESTK_SE1_LIST = [
    "A06573746B6D65FFFF4953442D522031",
    "A0000005591010FFFFFFFF8900000100",
    "A0000005591010FFFFFFFF8900050500",
    "A0000005591010000000008900000300",
    "A0000005591010FFFFFFFF8900000177",
].join(",");

// Backward-compatible export used by native adapters; reads from preferences each time
export function getAIDList(): string {
    const stored = preferences.getString('aid.list');
    if (stored && stored.trim().length > 0) return sanitizeAIDList(stored);
    return PRESET_AID_LIST;
}

// Helper to set entire list (comma-separated)
export function setAIDList(listCsv: string) {
    preferences.set('aid.list', sanitizeAIDList(listCsv));
}

// Reset helpers
export function resetAIDsToPreset() {
    preferences.set('aid.list', PRESET_AID_LIST);
}

export function setAIDsToGsmaOnly() {
    preferences.set('aid.list', GSMA_AID);
}

export function setAIDsToEstkSe0() {
    preferences.set('aid.list', ESTK_SE0_LIST);
}

export function setAIDsToEstkSe1() {
    preferences.set('aid.list', ESTK_SE1_LIST);
}

// Sanitize CSV: trim, uppercase, remove empties and duplicates
export function sanitizeAIDList(listCsv: string): string {
    const seen = new Set<string>();
    return listCsv
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0 && /^[0-9A-F]+$/.test(s) && !seen.has(s) && (seen.add(s) || true))
        .join(',');
}

