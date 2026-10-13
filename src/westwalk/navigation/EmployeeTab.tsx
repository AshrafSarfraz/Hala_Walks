import React from 'react';
import FamilyTabs from './FamilyTabs';
export default function EmployeeTab({navigation}: {navigation: any}) {
  return <FamilyTabs navigation={navigation} role="staff" />;
}
