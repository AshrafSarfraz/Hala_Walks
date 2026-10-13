import {getBrandCatalog} from '../hooks/useBrandCatalog';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {firestore} from './firebaseconfig';

export const fetchBrandsFromFirebase = async (): Promise<any[]> =>
  getBrandCatalog();

export const fetchFlatOfferFromFirebase = async () => {
  try {
    // Directly fetch data from Firebase without using AsyncStorage
    const snapshot = await firestore().collection('Flat-Offer').get();
    const data: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Save fresh data in AsyncStorage for next time
    await AsyncStorage.setItem('flatoffer_cache', JSON.stringify(data));
    return data; // Return freshly fetched data from Firebase
  } catch (error) {
    // Handle the error appropriately (console log, show error message, etc.)
    console.error('Error fetching offers:', error);
    const cached = await AsyncStorage.getItem('flatoffer_cache').catch(
      () => null,
    );
    try {
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};

export const fetchEventsFromFirebase = async () => {
  try {
    // Directly fetch data from Firebase without using AsyncStorage
    const snapshot = await firestore().collection('Events').get();
    const data: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Save fresh data in AsyncStorage for next time
    await AsyncStorage.setItem('events_cache', JSON.stringify(data));
    return data; // Return freshly fetched data from Firebase
  } catch (error) {
    // Handle the error appropriately (console log, show error message, etc.)
    console.error('Error fetching events:', error);
    const cached = await AsyncStorage.getItem('events_cache').catch(() => null);
    try {
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};

export const fetch_Tenant_Data = async () => {
  try {
    // Directly fetch data from Firebase without using AsyncStorage
    const snapshot = await firestore().collection('Tenants').get();
    const data: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data; // Return freshly fetched data from Firebase
  } catch (error) {
    // Handle the error appropriately (console log, show error message, etc.)
    console.error('❌ Error fetching flat offers:', error);
    return []; // Return empty array if error occurs
  }
};

export const fetch_OrgEmp_Data = async () => {
  try {
    // Directly fetch data from Firebase without using AsyncStorage
    const snapshot = await firestore().collection('Employees').get();
    const data: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data; // Return freshly fetched data from Firebase
  } catch (error) {
    // Handle the error appropriately (console log, show error message, etc.)
    console.error('❌ Error fetching flat offers:', error);
    return []; // Return empty array if error occurs
  }
};
