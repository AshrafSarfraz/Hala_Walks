// DetectCountry.tsx
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

interface DetectCountryProps {
  onCountryDetect: (country: string) => void;
}

const DetectCountry: React.FC<DetectCountryProps> = ({ onCountryDetect }) => {
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        }
      } else {
        const authStatus = await Geolocation.requestAuthorization('whenInUse');
        if (authStatus === 'granted') {
          getLocation();
        }
      }
    };

    const getLocation = () => {
      const latitude= 25.276987
      const  longitude= 51.520008
      fetchCountry(latitude, longitude);
      // Geolocation.getCurrentPosition(
      //   position => {
      //   const { latitude, longitude } = position.coords;
      //     fetchCountry(latitude, longitude);
      //   },
      //   error => {
      //     console.error(error);
      //   },
      //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      // );
    };

    const fetchCountry = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins`
        );
        const data = await response.json();
        const countryComponent = data.results[0].address_components.find((component: any) =>
          component.types.includes('country')
        );
        const countryName = countryComponent ? countryComponent.long_name : 'Unknown';
        onCountryDetect(countryName);
      } catch (error) {
        console.error('Error fetching country:', error);
        onCountryDetect('Error fetching country');
      }
    };

    requestLocationPermission();
  }, []);

  return null; // No UI needed
};

export default DetectCountry;
