import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {Button, Image, View} from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import axios from 'axios';
import {BASE_URL} from '../../config/api';
import {Text} from '../../ui/Text';
import {uploadCheckInPhoto} from '../api/checkIn';
import {ensurePermission} from '../permissions/service';
import {getDeviceLocation} from '../utils/getDeviceLocation';
import {useCustomAlert} from './components/customAlert';

export default function MapCaptureScreen() {
  const [image, setImage] = useState<Asset | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [progress, setProgress] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const uploaded = useRef<{uri: string; url: string} | null>(null);
  const requestId = useRef('');
  const {alert, AlertComponent} = useCustomAlert();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);

  const getLocation = async () => {
    if (locating || busy.current) return;
    setLocating(true);
    try {
      if (!(await ensurePermission('location')))
        throw new Error('Location permission is required.');
      const coords = await getDeviceLocation();
      if (alive.current) setLocation(coords);
    } catch (e: any) {
      if (alive.current)
        alert('Location unavailable', e.message || 'Please try again.');
    } finally {
      if (alive.current) setLocating(false);
    }
  };
  const choose = async (camera: boolean) => {
    if (busy.current) return;
    if (camera && !(await ensurePermission('camera'))) return;
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1600,
      maxHeight: 1600,
      saveToPhotos: false,
    };
    const result = camera
      ? await launchCamera(options)
      : await launchImageLibrary({...options, selectionLimit: 1});
    if (!alive.current || result.didCancel) return;
    if (result.errorCode) {
      alert('Photo error', result.errorMessage || result.errorCode);
      return;
    }
    if (result.assets?.[0]?.uri) {
      setImage(result.assets[0]);
      uploaded.current = null;
      requestId.current = `capture_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
      setProgress(0);
    }
  };
  const upload = async () => {
    if (busy.current) return;
    if (!image?.uri || !location) {
      alert('Missing', 'Please select a photo and get your location.');
      return;
    }
    busy.current = true;
    setLoading(true);
    const current = new AbortController();
    controller.current = current;
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (!token) throw new Error('Please sign in again.');
      const config = {
        headers: {Authorization: `Bearer ${token}`},
        timeout: 20000,
        signal: current.signal,
      };
      const locRes = await axios.post(
        `${BASE_URL}/api/hbs/map/location`,
        {lat: location.latitude, lng: location.longitude},
        config,
      );
      const locationId = locRes.data?.data?._id ?? locRes.data?._id;
      if (!locationId) throw new Error('Unable to resolve your location.');
      const url =
        uploaded.current?.uri === image.uri
          ? uploaded.current.url
          : await uploadCheckInPhoto(
              image.uri,
              pct => {
                if (alive.current) setProgress(pct);
              },
              current.signal,
            );
      uploaded.current = {uri: image.uri, url};
      await axios.post(
        `${BASE_URL}/api/hbs/map/photos`,
        {
          locationId,
          image: url,
          caption: 'Uploaded from app',
          clientRequestId: requestId.current,
        },
        config,
      );
      if (!alive.current || current.signal.aborted) return;
      alert('Success', 'Photo uploaded');
      setImage(null);
      setLocation(null);
      setProgress(0);
      uploaded.current = null;
    } catch (e: any) {
      if (alive.current && !current.signal.aborted)
        alert(
          'Upload failed',
          e.response?.data?.message || e.message || 'Please retry.',
        );
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Button
        title="Take photo"
        disabled={loading}
        onPress={() => {
          void choose(true).catch(() => alert('Photo error', 'Please retry.'));
        }}
      />
      <Button
        title="Open image library"
        disabled={loading}
        onPress={() => {
          void choose(false).catch(() => alert('Photo error', 'Please retry.'));
        }}
      />
      <Button
        title={locating ? 'Getting location…' : 'Get location'}
        disabled={loading || locating}
        onPress={getLocation}
      />
      {image?.uri && (
        <Image
          source={{uri: image.uri}}
          style={{width: 200, height: 200, marginVertical: 20}}
        />
      )}
      {location && (
        <Text>
          Lat: {location.latitude} | Lng: {location.longitude}
        </Text>
      )}
      <Button
        title={loading ? `Uploading… ${progress}%` : 'Upload'}
        disabled={loading || locating}
        onPress={upload}
      />
      <AlertComponent />
    </View>
  );
}
