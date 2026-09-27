import type {ParamListBase} from '@react-navigation/native';

export type HalaStackParamList = ParamListBase & {
  StartChatScreen: undefined;

  ChatScreen: {
    chatId: string;
    participantName: string;
    participantId: string;
    participantAvatar?: string | null;
    participantHidesOnline?: boolean;
    participantHidesLastSeen?: boolean;
    isBlockedInitial?: boolean;
    isPendingChat?: boolean;
  };

  ImagePreview: {
    chatId: string;
    asset: {
      uri: string;
      type?: string;
      fileName?: string;
      fileSize?: number;
      width?: number;
      height?: number;
    };
  };

  Settings: undefined;
  MapProfile: undefined;
};
