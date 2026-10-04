import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import CachedImage from './CachedImage';
import {Colors} from '../../Themes/Colors';

export default function ImageGallery({
  images,
  inset = 0,
  height = 240,
}: {
  images: string[];
  inset?: number;
  height?: number;
}) {
  const {width} = useWindowDimensions();
  const pageWidth = Math.max(1, width - inset * 2);
  const [index, setIndex] = useState(0);
  const identity = images.join('|');
  useEffect(() => {
    setIndex(0);
  }, [identity, pageWidth]);
  useEffect(() => {
    // Warm only the visible photograph and its neighbours, rather than all originals.
    FastImage.preload(
      images
        .slice(Math.max(0, index - 1), index + 3)
        .map(uri => ({uri, cache: FastImage.cacheControl.web})),
    );
  }, [images, index]);
  return (
    <View>
      <FlatList
        key={`${identity}:${pageWidth}`}
        data={images.length ? images : ['']}
        horizontal
        pagingEnabled
        style={{width: pageWidth}}
        showsHorizontalScrollIndicator={false}
        keyExtractor={uri => uri}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, i) => ({
          length: pageWidth,
          offset: pageWidth * i,
          index: i,
        })}
        onMomentumScrollEnd={event =>
          setIndex(
            Math.min(
              images.length - 1,
              Math.max(
                0,
                Math.round(event.nativeEvent.contentOffset.x / pageWidth),
              ),
            ),
          )
        }
        renderItem={({item, index: i}) => (
          <CachedImage
            uri={item}
            priority={i === index ? 'high' : 'normal'}
            style={{width: pageWidth, height, borderRadius: inset ? 16 : 0}}
          />
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((uri, i) => (
            <View
              key={uri}
              style={[styles.dot, i === index && styles.active]}
            />
          ))}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {width: 6, height: 6, borderRadius: 4, backgroundColor: Colors.border},
  active: {width: 18, backgroundColor: Colors.accent},
});
