import React from 'react';
import {PageContainer} from 'nekokolpa';

// Plain elements for scaffolding — importing 'tamagui' here would bundle a
// second Tamagui instance and break every card.
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};
const Row = ({label, value}: {label: string; value: string}) => (
  <div style={card}>
    <div style={{color: '#f2f2f7', fontSize: 16}}>{label}</div>
    <div style={{color: '#8e8e99', fontSize: 12, marginTop: 2}}>{value}</div>
  </div>
);

/** The default: scrollable body with the standard 10px horizontal padding. */
export function Default() {
  return (
    <div style={{height: 380}}>
      <PageContainer>
        <Row label="Language" value="English" />
        <Row label="Theme" value="Follow device" />
        <Row label="SIM Slot display rules" value="All SIM card slots" />
      </PageContainer>
    </div>
  );
}

/** Wider gutters, for content that should not run to the screen edge. */
export function WideGutters() {
  return (
    <div style={{height: 380}}>
      <PageContainer horizontalPadding={32} topPadding={16}>
        <Row label="Redactions" value="None" />
        <Row label="Size Unit" value="B / kB / MB Adaptive" />
      </PageContainer>
    </div>
  );
}
