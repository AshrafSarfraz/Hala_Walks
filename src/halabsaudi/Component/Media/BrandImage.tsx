import React, {useEffect, useMemo, useState} from 'react';
import FastImage, {ImageStyle, Priority} from 'react-native-fast-image';
import {StyleProp} from 'react-native';
import {brandCover} from './brandCover';

type Props = {
  item: any;
  style: StyleProp<ImageStyle>;
  priority?: Priority;
  cache?: 'immutable' | 'web' | 'cacheOnly';
  onLoad?: () => void;
  onLoadEnd?: () => void;
  // sirf tab call hota hai jab photo aur logo dono fail ho jayein
  onError?: () => void;
};

/**
 * Brand ki pehli gallery image dikhata hai (cover).
 * Agar gallery image na ho ya load fail ho jaye to logo dikhata hai (contain).
 */
const BrandImage: React.FC<Props> = ({
  item,
  style,
  priority,
  cache,
  onLoad,
  onLoadEnd,
  onError,
}) => {
  const cover = useMemo(() => brandCover(item), [item]);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => setUseFallback(false), [cover.uri]);

  const showingLogo = cover.isLogo || useFallback;
  const uri = useFallback ? cover.fallback : cover.uri;

  return (
    <FastImage
      key={uri}
      source={{
        uri,
        priority: priority ?? FastImage.priority.normal,
        ...(cache ? {cache: FastImage.cacheControl[cache]} : null),
      }}
      style={style}
      resizeMode={
        showingLogo ? FastImage.resizeMode.contain : FastImage.resizeMode.cover
      }
      onLoad={onLoad}
      onLoadEnd={onLoadEnd}
      onError={() => {
        // photo fail -> logo try karo
        if (!useFallback && !cover.isLogo && cover.fallback) {
          setUseFallback(true);
          return;
        }
        onError?.();
      }}
    />
  );
};

export default BrandImage;
