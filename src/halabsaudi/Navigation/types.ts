import type {ParamListBase} from '@react-navigation/native';
export type HalaStackParamList = ParamListBase & {
  StartChatScreen: undefined;
  ChatScreen: {
    chatId: string; participantName: string; participantId: string;
    participantAvatar?: string | null; participantHidesOnline?: boolean;
    participantHidesLastSeen?: boolean; isBlockedInitial?: boolean; isPendingChat?: boolean;
  };
  ImagePreview: {
    asset: {uri: string; type?: string; fileName?: string};
    onSend: (asset: any, caption: string) => void | Promise<void>;
  };
  Settings: undefined;
  MapProfile: undefined;
};
