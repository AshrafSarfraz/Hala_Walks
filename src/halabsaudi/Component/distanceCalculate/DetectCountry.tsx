// DetectCountry.tsx
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

interface DetectCountryProps {
  onCountryDetect: (country: string) => void;
}

const DetectCountry: React.FC<DetectCountryProps> = ({ onCountryDetect }) => {
  useEffect(() => {
    const getLocation = () => {
      const latitude = 25.276987;
      const longitude = 51.520008;
      fetchCountry(latitude, longitude);
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

    getLocation();
  }, []);

  return null;
};

export default DetectCountry;
