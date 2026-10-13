import React, {useState} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Text} from './Text';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {memberInitials} from '../utils/member';
function PhotoAvatar({
  name,
  uri,
  size,
}: {
  name: string;
  uri: string;
  size: number;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <View
      accessibilityLabel={name || 'Profile'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <Text
        style={{
          fontFamily: Fonts.F_Bold,
          color: Colors.PrimaryColor,
          fontSize: Math.round(size * 0.34),
        }}>
        {memberInitials(name)}
      </Text>
      {!!uri && !failed && (
        <Image
          source={{uri}}
          style={[StyleSheet.absoluteFillObject, {opacity: ready ? 1 : 0}]}
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
export default function Avatar({
  name,
  uri = '',
  size = 72,
}: {
  name: string;
  uri?: string;
  size?: number;
}) {
  return <PhotoAvatar key={uri} name={name} uri={uri} size={size} />;
}
