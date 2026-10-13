import React from 'react';
import FamilyTabs from './FamilyTabs';
export default function CorporationTab({navigation}: {navigation: any}) {
  return <FamilyTabs navigation={navigation} role="org" />;
}
