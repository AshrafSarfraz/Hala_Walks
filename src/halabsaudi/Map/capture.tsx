// /src/halabsaudi/Map/capture.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { BASE_URL } from '../../config/api';



const MapCaptureScreen = () => {
  const [image, setImage] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Request Location Permission (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // 📍 Get Location
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Unable to fetch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const pickImage = () => {

  launchImageLibrary(

    {

      mediaType: 'photo',

      quality: 0.7,

    },

    response => {

      console.log('Image response:', response);

      if (response.assets?.length) {

        setImage(response.assets[0]);

      }

    },

  );

};
  // 📸 Open Camera
  const openCamera = async () => {
  launchCamera(
    {
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: true,
    },
    response => {
      console.log('FULL CAMERA RESPONSE:', response);

      if (response.didCancel) {
        console.log('User cancelled');
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Camera Error',
          `${response.errorCode} - ${response.errorMessage}`,
        );
        return;
      }

      if (response.assets?.length) {
        setImage(response.assets[0]);
      }
    },
  );
};

  // 🚀 Upload Flow
  const upload = async () => {
    if (!image || !location) {
      Alert.alert('Missing', 'Please capture image & location');
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create / Get Location
      const locRes = await axios.post(`${BASE_URL}/api/hbs/map/location`, {
        lat: location.latitude,
        lng: location.longitude,
      });

      const locationId = locRes?.data?.data?._id ?? locRes?.data?._id;

      // ⚠️ TEMP: Using local URI (replace with S3 later)
      const imageUrl = image.uri;

      // 2️⃣ Upload Photo
      await axios.post(`${BASE_URL}/api/hbs/map/photos`, {
        locationId,
        image: imageUrl,
        caption: 'Uploaded from app',
      });

      Alert.alert('Success', 'Photo uploaded 🎉');

      // Reset
      setImage(null);
      setLocation(null);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="📸 Open Camera" onPress={openCamera} />
      <Button title="🖼️ Open Image Library" onPress={pickImage} />
      <View style={{height: 10}} />

      <Button title="📍 Get Location" onPress={getLocation} />
      <View style={{height: 10}} />

      <Button
        title={loading ? 'Uploading...' : '🚀 Upload'}
        onPress={upload}
        disabled={loading}
      />

      {/* Preview */}
      {image && (
        <Image
          source={{uri: image.uri}}
          style={{width: 200, height: 200, marginTop: 20}}
        />
      )}

      {/* Location Info */}
      {location && (
        <Text style={{marginTop: 10}}>
          Lat: {location.latitude} | Lng: {location.longitude}
        </Text>
      )}
    </View>
  );
};

export default MapCaptureScreen;
