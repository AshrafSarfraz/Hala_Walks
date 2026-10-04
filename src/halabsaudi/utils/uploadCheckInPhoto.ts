import storage from '@react-native-firebase/storage';
/** Bounded upload with throttled progress and cancellation on screen exit. */
export function uploadCheckInPhoto(
  uri: string,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('Upload cancelled'));
      return;
    }
    const ref = storage().ref(
      `mapGallery/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
    );
    const task = ref.putFile(uri);
    let settled = false;
    let lastPercent = -1;
    let lastUpdate = 0;
    const finish = (url?: string, error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      unsubscribe();
      if (error) reject(error);
      else resolve(url!);
    };
    const cancel = () => {
      void task.cancel().catch(() => {});
      finish(undefined, new Error('Upload cancelled'));
    };
    const timer = setTimeout(() => {
      void task.cancel().catch(() => {});
      finish(undefined, new Error('Photo upload timed out. Please try again.'));
    }, 60000);
    let unsubscribe = () => {};
    signal.addEventListener('abort', cancel);
    unsubscribe = task.on(
      'state_changed',
      snapshot => {
        const percent = Math.round(
          (snapshot.bytesTransferred / Math.max(1, snapshot.totalBytes)) * 100,
        );
        const now = Date.now();
        if (
          percent !== lastPercent &&
          (percent === 100 || now - lastUpdate >= 200)
        ) {
          lastPercent = percent;
          lastUpdate = now;
          onProgress(percent);
        }
      },
      error => finish(undefined, error),
      () => {
        void ref.getDownloadURL().then(
          url => finish(url),
          error => finish(undefined, error),
        );
      },
    );
  });
}
