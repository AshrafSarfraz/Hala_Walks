import {useCallback, useRef} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connectSocket, getSocket} from './socket';

// Retain visible content on blur/resume. Reset only when the requested identity changes.
export function useSocialRefresh(
  load: (signal: AbortSignal) => Promise<void>,
  clear: () => void,
) {
  const previousLoad = useRef(load);
  useFocusEffect(
    useCallback(() => {
      if (previousLoad.current !== load) clear();
      previousLoad.current = load;
      let controller: AbortController | undefined;
      let disposed = false;
      let busy = false;
      let queued = false;
      let socket = getSocket();
      const refresh = () => {
        if (
          disposed ||
          AppState.currentState === 'background' ||
          AppState.currentState === 'inactive'
        )
          return;
        if (busy) {
          queued = true;
          return;
        }
        busy = true;
        controller = new AbortController();
        const signal = controller.signal;
        void Promise.resolve()
          .then(() => load(signal))
          .catch(() => {})
          .finally(() => {
            busy = false;
            if (!disposed && queued) {
              queued = false;
              refresh();
            }
          });
      };
      const attach = () => {
        socket?.on('social-updated', refresh);
        socket?.on('connect', refresh);
      };
      refresh();
      if (socket) attach();
      else
        void AsyncStorage.getItem('hala_token')
          .then(token => {
            if (!disposed && token) {
              socket = connectSocket(token);
              attach();
            }
          })
          .catch(() => {});
      const subscription = AppState.addEventListener('change', state => {
        if (state === 'active') refresh();
        else if (state === 'background') {
          queued = false;
          controller?.abort();
        }
      });
      // Socket events are primary; polling is only a disconnected fallback.
      const timer = setInterval(() => {
        if (AppState.currentState === 'active' && !socket?.connected) refresh();
      }, 120000);
      return () => {
        disposed = true;
        controller?.abort();
        clearInterval(timer);
        subscription.remove();
        socket?.off('social-updated', refresh);
        socket?.off('connect', refresh);
      };
    }, [load, clear]),
  );
}
