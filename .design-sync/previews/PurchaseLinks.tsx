import React from 'react';
import {PurchaseLinks} from 'nekokolpa';

/** The default: footer links shown under an empty profile list. */
export function Default() {
  return <PurchaseLinks />;
}

/** Tightened top margin, for placement directly under existing content. */
export function TightMargin() {
  return <PurchaseLinks topMargin={8} />;
}
