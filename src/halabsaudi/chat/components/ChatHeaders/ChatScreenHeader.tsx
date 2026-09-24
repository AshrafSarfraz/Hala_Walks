import UserAvatar from '../../../Component/UserAvatar';
import {Text} from '../../../../ui/Text';
// src/halabsaudi/Component/ChatHeaders/ChatScreenHeader.tsx
import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet, Platform} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Colors} from '../../../Themes/Colors';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {RootState} from '../../../redux_toolkit/store';

type Props = {
  name: string;
  userId: string;
  avatarUri?: string | null;
  onBackPress: () => void;
  onProfilePress: () => void;
  isBlocked: boolean;
  isOnline: boolean;
  lastSeen?: string;
  isMuted?: boolean;
  hidesOnline?: boolean;
  hidesLastSeen?: boolean;
};

export default function ChatScreenHeader({
  name,
  userId,
  avatarUri,
  onBackPress,
  onProfilePress,
  isBlocked,
  isOnline,
  lastSeen,
  hidesOnline = false,
  hidesLastSeen = false,
  isMuted = false,
}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';


  const getStatusText = () => {
    if (isBlocked) return t.status_blocked;
    if (isOnline && !hidesOnline) return t.status_online;
    if (!hidesLastSeen && lastSeen && lastSeen !== 'Invalid date')
      return `${t.status_last_seen} ${lastSeen}`;
    return '';
  };

  return (
    <View style={[styles.container, {flexDirection: rowDir}]}>
     

      {/* Back — chevron flips for RTL */}
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backBtn}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Ionicons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          color={Colors.White}
          size={22}
        />
      </TouchableOpacity>

      {/* Avatar + name */}
      <TouchableOpacity
        style={[styles.profileWrap, {flexDirection: rowDir}]}
        activeOpacity={0.7}
        onPress={onProfilePress}>

        <View style={[
          styles.avatarWrap,
          isRTL ? {marginLeft: 10, marginRight: 0} : {marginRight: 10},
        ]}>
          <UserAvatar uri={avatarUri} style={styles.avatarImage} />
          {isOnline && !isBlocked && !hidesOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={[
          styles.textBlock,
          {alignItems: isRTL ? 'flex-end' : 'flex-start'},
          !getStatusText() && {justifyContent: 'center'},
        ]}>
          <View style={[styles.nameRow, {flexDirection: rowDir}]}>
            <Text style={[styles.nameText, {textAlign: isRTL ? 'right' : 'left'}]} numberOfLines={1}>
              {name}
            </Text>
            {isMuted && (
              <Ionicons
                name="notifications-off-outline"
                size={13}
                color="rgba(255,255,255,0.6)"
                style={isRTL ? {marginRight: 4} : {marginLeft: 4}}
              />
            )}
          </View>
          {!!getStatusText() && (
            <Text
              style={[
                styles.statusText,
                {textAlign: isRTL ? 'right' : 'left'},
                isOnline && !isBlocked && {color: '#A8F0CF'},
                isBlocked && {color: '#ffb3b3'},
              ]}>
              {getStatusText()}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Info button */}
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={onProfilePress}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Ionicons name="information-circle-outline" size={24} color={Colors.White} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkgrey,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 14,
  },
 
  backBtn: {padding: 8, marginRight: 4},
  profileWrap: {flex: 1, alignItems: 'center'},
  avatarWrap: {position: 'relative'},
  avatarImage: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarLetter: {color: '#fff', fontWeight: '700', fontSize: 17},
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: Colors.Green,
  },
  textBlock: {flex: 1},
  nameRow: {alignItems: 'center', gap: 4},
  nameText: {color: '#fff', fontWeight: '700', fontSize: 16, flexShrink: 1},
  statusText: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},
  profileBtn: {padding: 8, marginLeft: 4},
});





