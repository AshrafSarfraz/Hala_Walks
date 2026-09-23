import {useCallback} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getSocket} from './socket';

// Revalidate on return, reconnection, social changes and while visible.
// Each caller receives an AbortSignal so old profiles cannot overwrite a new one.
export function useSocialRefresh(load: (signal: AbortSignal) => Promise<void>, clear: () => void) {
  useFocusEffect(useCallback(() => {
    let current: AbortController | undefined;
    const refresh = () => {
      current?.abort();
      current = new AbortController();
      void load(current.signal);
    };
    clear();
    refresh();
    const socket = getSocket();
    socket?.on('social-updated', refresh);
    socket?.on('connect', refresh);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
      else {current?.abort(); clear();}
    });
    const timer = setInterval(() => {if (AppState.currentState === 'active') refresh();}, 30000);
    return () => {
      current?.abort(); clearInterval(timer); subscription.remove();
      socket?.off('social-updated', refresh); socket?.off('connect', refresh);
      clear();
    };
  }, [load, clear]));
}
