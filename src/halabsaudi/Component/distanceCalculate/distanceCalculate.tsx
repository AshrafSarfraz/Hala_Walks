import {Text} from '../../../ui/Text';
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {} from 'react-native';
import {Fonts} from '../../Themes/Fonts';
import {Colors} from '../../Themes/Colors';

interface DistanceFromDeviceProps {
  userLat: number;
  userLong: number;
  targetLat: number;
  targetLong: number;
  kmText: string;
  mText: string;
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const DistanceFromDevice: React.FC<DistanceFromDeviceProps> = ({
  userLat,
  userLong,
  targetLat,
  targetLong,
  kmText,
  mText,
}) => {
  // Agar location nahi mili ya target coordinates nahi hain
  if (!userLat || !userLong || !targetLat || !targetLong) {
    return (
      <Text style={textStyle}>--</Text>
    );
  }

  const distanceInKm = haversineDistance(userLat, userLong, targetLat, targetLong);

  const distanceText =
    distanceInKm < 1
      ? `${(distanceInKm * 1000).toFixed(0)} ${mText}`
      : `${distanceInKm.toFixed(2)} ${kmText}`;

  return <Text style={textStyle}>{distanceText}</Text>;
};

const textStyle = {
  fontSize: 10,
  color: Colors.dargBg,
  fontFamily: Fonts.SF_Medium,
  lineHeight: 14,
  marginLeft: 2,
};

export default DistanceFromDevice;