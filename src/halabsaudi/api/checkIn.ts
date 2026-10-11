import storage from '@react-native-firebase/storage';
import axios from 'axios';
import {BASE_URL} from '../../config/api';

// Bound both the native transfer and URL lookup; abort also cancels the native task.
export function uploadCheckInPhoto(uri: string, onProgress: (pct: number) => void, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const ref = storage().ref(`mapGallery/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
    let task: ReturnType<typeof ref.putFile> | undefined;
    let unsubscribe: (() => void) | undefined;
    let settled = false;
    let lastProgress = -1;
    const finish = (error?: Error, url?: string) => {
      if (settled) {return;}
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      unsubscribe?.();
      if (error) {
        if (task) {void task.cancel().catch(() => {});}
        reject(error);
      } else {resolve(url!);}
    };
    const abort = () => finish(new Error('Upload cancelled.'));
    const timer = setTimeout(() => finish(new Error('Photo upload timed out. Please retry.')), 90000);
    signal.addEventListener('abort', abort);
    if (signal.aborted) {abort(); return;}
    try {
      task = ref.putFile(uri);
      unsubscribe = task.on('state_changed', snapshot => {
        if (settled || !snapshot.totalBytes) {return;}
        const pct = Math.min(99, Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100));
        if (pct !== lastProgress) {lastProgress = pct; onProgress(pct);}
      });
      // Observe the task promise as well, so native failures cannot leave an unhandled rejection.
      void task.then(async () => {
        if (settled) {return;}
        try {finish(undefined, await ref.getDownloadURL());}
        catch (error) {finish(error as Error);}
      }, error => finish(error));
    } catch (error) {finish(error as Error);}
  });
}

export type CheckInPhoto = {
  id: string; uri: string; downloadUrl: string | null; saved?: boolean;
};
type PhotoPatch = {progress?: number | null; downloadUrl?: string; error?: boolean; saved?: boolean};
export async function submitCheckIn(
  photos: CheckInPhoto[], brandId: string, caption: string, token: string,
  signal: AbortSignal, patch: (id: string, values: PhotoPatch) => void,
) {
  if (!token) {throw new Error('Please sign in again.');}
  // Save each photo before starting the next: retries retain completed work.
  for (const photo of photos) {
    if (signal.aborted) {throw new Error('Upload cancelled.');}
    if (photo.saved) {continue;}
    try {
      patch(photo.id, {error: false, progress: photo.downloadUrl ? 100 : 0});
      const url = photo.downloadUrl || await uploadCheckInPhoto(photo.uri, progress => patch(photo.id, {progress}), signal);
      patch(photo.id, {downloadUrl: url, progress: 100});
      await axios.post(`${BASE_URL}/api/hbs/map/photos`, {
        brandId, image: url, caption: caption.trim() || 'Uploaded from app', clientRequestId: photo.id,
      }, {headers: {Authorization: `Bearer ${token}`}, timeout: 20000, signal});
      patch(photo.id, {saved: true});
    } catch (error) {
      patch(photo.id, {error: true, progress: null});
      throw error;
    }
  }
}
