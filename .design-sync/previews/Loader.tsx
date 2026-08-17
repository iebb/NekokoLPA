import React from 'react';
import {Loader} from 'nekokolpa';

/** The default: a full-size spinner with a caption naming the operation. */
export function WithCaption() {
  return <Loader text="Reading eUICC…" />;
}

/** Compact form, for use inline within a list row or card. */
export function Compact() {
  return <Loader compact text="Refreshing" />;
}

/** No caption — the spinner alone. */
export function SpinnerOnly() {
  return <Loader />;
}
