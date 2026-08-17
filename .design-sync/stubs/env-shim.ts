// Tamagui and react-native-web read `process.env.*` at module scope (feature
// flags like TAMAGUI_CSS_VARIABLE_PREFIX, TEST_NATIVE_PLATFORM). esbuild only
// substitutes `process.env.NODE_ENV`, so every other read hits a bare `process`
// that does not exist in a browser and throws before anything mounts.
//
// This module is listed FIRST in cfg.extraEntries. package-build synthesizes
// `.bundle-entry.mjs` with the extraEntries `export *` lines ahead of the main
// entry, and ESM evaluation follows import order, so this runs before any
// component module is initialized.
declare const globalThis: {process?: {env: Record<string, string | undefined>}};
declare const document: any;

if (!globalThis.process) {
  globalThis.process = {env: {}};
}

// react-native-web lazily creates <style id="react-native-stylesheet"> in
// <head> and fills it through the CSSOM (sheet.insertRule), so the element's
// innerHTML stays empty. package-validate picks the preview root with
// `document.querySelectorAll('#root, [id^="r"]')[0]` in document order — that
// stylesheet matches `[id^="r"]` and precedes the card's own #r0, so every page
// reports `[RENDER] root empty` no matter what rendered.
//
// Pre-creating the element makes RNW adopt it (it looks the id up before
// creating one), and appending it to the END of <body> puts it after the card's
// own #r0 in document order — so `roots[0]` is the real preview root and both
// the render check and the floor-card fallback behave normally. Seeding it in
// <head> instead would mask every empty render, which is worse than the bug.
//
// A <style> in <body> is valid HTML5 and applies exactly the same.
if (typeof document !== 'undefined' && !document.getElementById('react-native-stylesheet')) {
  const style = document.createElement('style');
  style.id = 'react-native-stylesheet';
  (document.body ?? document.documentElement).appendChild(style);
}

// React Native modules assume a `global` binding; the browser calls it
// `globalThis`. Without this alias any module touching `global` throws before
// the screen mounts.
if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

export const __dsEnvShim = true;
