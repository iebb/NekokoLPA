import React from 'react';
import {SafeScreen} from 'nekokolpa';

/**
 * The themed root every screen sits in: it paints $background and insets the
 * content by the device's safe area. Previews report zero insets, so what the
 * card shows is the themed surface and the status-bar handling.
 */
export function Default() {
  return (
    <div style={{height: 300}}>
      <SafeScreen>
        <div style={{padding: 20}}>
          <div style={{color: '#f2f2f7', fontSize: 28, fontWeight: 700}}>Notifications</div>
          <div style={{color: '#8e8e99', fontSize: 12, marginTop: 4}}>4 pending</div>
        </div>
      </SafeScreen>
    </div>
  );
}
