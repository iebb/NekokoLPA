import React from 'react';
import {Screen} from 'nekokolpa';

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

/**
 * The composition every settings-style screen uses: SafeScreen + Title +
 * PageContainer in one component.
 */
export function TitledScreen() {
  return (
    <div style={{height: 420}}>
      <Screen title="Settings" subtitle="Customize app preferences">
        <Row label="Language" value="English" />
        <Row label="Theme" value="Follow device" />
        <Row label="Theme Color" value="Purple" />
      </Screen>
    </div>
  );
}

/** A fixed header pinned above the scrolling body. */
export function WithFixedHeader() {
  return (
    <div style={{height: 420}}>
      <Screen
        title="Notifications"
        fixedHeader={
          <div style={{padding: '0 20px 8px', color: '#813FF3', fontSize: 12, fontWeight: 700}}>
            4 PENDING
          </div>
        }>
        <Row label="Enable" value="AIMobile · 16 Aug" />
        <Row label="Delete" value="WEBBING · 14 Aug" />
      </Screen>
    </div>
  );
}
