// react-native-svg ships browser implementations as .web.js siblings, which
// Metro picks up through platform-extension resolution. The converter's esbuild
// pass has no such resolution, so point the bare specifier straight at the web
// element set. This is upstream's own web build, not a reimplementation.
export * from 'react-native-svg/lib/module/elements.web.js';
export {default} from 'react-native-svg/lib/module/elements.web.js';
