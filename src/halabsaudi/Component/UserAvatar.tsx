import React, {useState} from 'react';
import {Image, ImageStyle, StyleProp} from 'react-native';

// Replace this asset to change the default picture everywhere in Hala.
export const DEFAULT_PROFILE_IMAGE = require('../assets/Icons/profile.png');

export default function UserAvatar({uri, style}: {uri?: string | null; style?: StyleProp<ImageStyle>}) {
  const value = typeof uri === 'string' ? uri.trim() : '';
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const remote = value && value !== failedUri;
  return <Image source={remote ? {uri: value} : DEFAULT_PROFILE_IMAGE}
    style={[{width: 48, height: 48, borderRadius: 24, backgroundColor: '#E4E7EC'}, style, {tintColor: undefined}]}
    resizeMode="cover" accessibilityLabel="Profile picture"
    onError={() => setFailedUri(value)} />;
}
