import React from 'react';
import {BlockingLoader} from 'nekokolpa';

/** The default: a device operation in flight, with no progress to report. */
export function Loading() {
  return <BlockingLoader visible title="Reading eUICC" subtitle="Generic EMV Smartcard Reader" />;
}

/** A profile download, where the LPA does know how far along it is. */
export function WithProgress() {
  return (
    <BlockingLoader visible title="Downloading profile" subtitle="AI Mobile" progress={0.62} />
  );
}

/** Terminal success state, shown before the loader dismisses. */
export function Success() {
  return <BlockingLoader visible state="success" title="Profile installed" subtitle="AIMobile" />;
}

/** Terminal failure — the SM-DP+ rejected the order. */
export function Error() {
  return (
    <BlockingLoader
      visible
      state="error"
      title="Download failed"
      subtitle="The activation code has already been used."
    />
  );
}
