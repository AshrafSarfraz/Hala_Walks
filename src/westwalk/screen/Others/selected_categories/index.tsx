import React from 'react';
import CatalogListScreen from '../../../components/CatalogListScreen';
export default function SelectedCategories({route}: {route: any}) {
  return <CatalogListScreen category={route.params?.item} />;
}
