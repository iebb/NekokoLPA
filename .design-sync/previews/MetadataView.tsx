import React from 'react';
import {MetadataView} from 'nekokolpa';

/** A downloaded operational profile, as the card reports it. */
export function OperationalProfile() {
  return (
    <MetadataView
      metadata={{
        iccid: '8944538523410512345',
        profileState: 1,
        profileName: 'AIMobile',
        profileNickname: 'Travel data',
        serviceProviderName: 'AI Mobile',
        profileOwnerMccMnc: '310260',
      }}
    />
  );
}

/** No nickname set — the row falls back to the provider and profile names. */
export function WithoutNickname() {
  return (
    <MetadataView
      metadata={{
        iccid: '8933150319912345678',
        profileState: 0,
        profileName: 'WEBBING',
        serviceProviderName: 'Truely',
        profileOwnerMccMnc: '20801',
      }}
    />
  );
}
