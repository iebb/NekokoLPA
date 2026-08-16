/**
 * Optional wrapper around @react-native-ml-kit/barcode-scanning.
 *
 * ML Kit is excluded from Mac Catalyst builds (its vendored frameworks have no
 * Catalyst slice — see react-native.config.js), so the native module may be
 * absent at runtime. Importing it statically would crash the Download screen on
 * those builds, hence the guarded require.
 */

interface BarcodeResult {
  rawValue?: string;
  displayValue?: string;
  text?: string;
  value?: string;
}

interface BarcodeScanningModule {
  scan(uri: string): Promise<BarcodeResult[]>;
}

let cached: BarcodeScanningModule | null | undefined;

function loadModule(): BarcodeScanningModule | null {
  if (cached === undefined) {
    try {
      cached = require('@react-native-ml-kit/barcode-scanning').default ?? null;
    } catch {
      cached = null;
    }
  }
  return cached ?? null;
}

/** True when scanning a QR code out of an image file is supported here. */
export function isImageScanningAvailable(): boolean {
  return loadModule() !== null;
}

/**
 * Decodes the first barcode found in an image.
 *
 * @returns the decoded text, or null if nothing was found or the platform
 *   has no image scanner.
 */
export async function scanBarcodeFromImage(uri: string): Promise<string | null> {
  const module = loadModule();
  if (!module) {
    return null;
  }
  const results = await module.scan(uri);
  if (!results?.length) {
    return null;
  }
  const first = results[0];
  return first.rawValue ?? first.displayValue ?? first.text ?? first.value ?? null;
}
