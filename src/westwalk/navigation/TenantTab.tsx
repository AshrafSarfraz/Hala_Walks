import React from 'react';
import FamilyTabs from './FamilyTabs';
export default function TenantTab({navigation}: {navigation: any}) {
  return <FamilyTabs navigation={navigation} role="tenant" />;
}
