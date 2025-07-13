// components/common/EmptyStateScreen.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { NoDataFound } from '../../theme/Images';
import { languageData } from '../../redux/language/languageSlice';
import { RootState } from '../../redux/store';

const EmptyStateScreen: React.FC = () => {
  const language = useSelector((state: RootState) => state.language.language);

  return (
    <View style={styles.emptyContainer}>
      <Image
        source={NoDataFound}
        style={styles.noDataImage}
      />
      <Text style={styles.noDataText}>
        {languageData[language].No_Items_Found}
      </Text>
    </View>
  );
};

export default EmptyStateScreen;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  noDataImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
