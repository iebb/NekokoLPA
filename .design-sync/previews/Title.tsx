import React from 'react';
import {Title} from 'nekokolpa';

/** Screen heading with a supporting line — how every Screen renders its header. */
export function WithSubtitle() {
  return <Title subtitle="Customize app preferences">Settings</Title>;
}

/** Subtitle omitted: the heading stands alone. */
export function HeadingOnly() {
  return <Title>Notifications</Title>;
}
