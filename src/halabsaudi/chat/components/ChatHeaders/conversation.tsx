import {Text} from '../../../../ui/Text';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TextInput} from '../../../../ui/TextInput';
// src/halabsaudi/Component/ChatHeaders/conversation.tsx
import React, {useState, useRef} from 'react';
import {View, TouchableOpacity, StyleSheet, Animated, Platform} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {getAvatarColor} from '../../../Themes/avatarColor';
import {Colors} from '../../../Themes/Colors';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {RootState} from '../../../redux_toolkit/store';

type Props = {
  profileName?: string;
  profileId?: string;
  onProfilePress?: () => void;
  onSearch?: (text: string) => void;
};

export default function ConversationHeader({
  profileName = '',
  profileId = '',
  onProfilePress,
  onSearch,
}: Props) {
  const insets = useSafeAreaInsets();
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText]     = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;

  const avatarLetter = profileName.charAt(0).toUpperCase();
  const avatarBg     = getAvatarColor(profileId);

  const openSearch = () => {
    setSearchActive(true);
    Animated.spring(searchAnim, {
      toValue: 1, useNativeDriver: true, tension: 80, friction: 10,
    }).start();
  };

  const closeSearch = () => {
    Animated.timing(searchAnim, {
      toValue: 0, duration: 180, useNativeDriver: true,
    }).start(() => {
      setSearchActive(false);
      setSearchText('');
      onSearch?.('');
    });
  };

  const handleChange = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  const searchTranslate = searchAnim.interpolate({
    inputRange: [0, 1], outputRange: [-8, 0],
  });

  return (
    <View style={[styles.wrapper, {paddingTop: insets.top + 16}]}>
      

      {/* ── Top row ── */}
      <View style={[styles.topRow, {flexDirection: rowDir}]}>
        <View style={{alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
          <Text style={[styles.eyebrow, {textAlign: isRTL ? 'right' : 'left'}]}>
            {t.hala_community}
          </Text>
          <Text style={[styles.title, {textAlign: isRTL ? 'right' : 'left'}]}>
            {t.messages_title}
          </Text>
        </View>

        <View style={[styles.actions, {flexDirection: rowDir}]}>
          <TouchableOpacity style={styles.iconBtn} onPress={openSearch}>
            <Ionicons name="search-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatar, {backgroundColor: avatarBg}]}
            onPress={onProfilePress}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
            
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search row ── */}
      {searchActive && (
        <Animated.View
          style={[
            styles.searchRow,
            {
              flexDirection: rowDir,
              opacity: searchAnim,
              transform: [{translateY: searchTranslate}],
            },
          ]}>
          <View style={[styles.searchBox, {flexDirection: rowDir}]}>
            <Ionicons
              name="search"
              size={15}
              color="rgba(255,255,255,0.55)"
              style={isRTL ? {marginLeft: 7} : {marginRight: 7}}
            />
            <TextInput
  autoFocus
  placeholder={t.search_messages}
  underlineColorAndroid="transparent"
  style={[
    styles.searchInput,
    {
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
  ]}
  value={searchText}
  onChangeText={handleChange}
  returnKeyType="search"
/>
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleChange('')}>
                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{t.cancel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Stats strip ── */}
      {!searchActive && (
        <View style={[styles.statsStrip, {flexDirection: rowDir}]}>
          <Text style={styles.statText}>{t.long_press_delete}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.darkgrey,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
    overflow: 'hidden',
  },

  topRow: {justifyContent: 'space-between', alignItems: 'flex-start'},
  eyebrow: {
    fontSize: 11, color: Colors.White,
    letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3,
  },
  title: {color: Colors.White, fontSize: 26, fontWeight: '800', letterSpacing: -0.4},
  actions: {alignItems: 'center', gap: 10, marginTop: 4},
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.LightGreen,
    position: 'relative',
  },
  avatarText: {color: Colors.White, fontWeight: '800', fontSize: 15},
  onlineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.LightGreen,
    position: 'absolute', bottom: -1, right: -1,
    borderWidth: 2, borderColor: Colors.Green,
  },
  searchRow: {alignItems: 'center', marginTop: 14, gap: 10},
  searchBox: {
    flex: 1, alignItems: 'center',
    borderRadius: 24, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    color: Colors.White,
    fontSize: 14,
    // wrapper / Android ki default styling reset
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cancelBtn: {paddingVertical: 4},
  cancelText: {color: Colors.LightGreen, fontSize: 14, fontWeight: '600'},
  statsStrip: {alignItems: 'center', marginTop: 14, gap: 10},
  statItem: {alignItems: 'center', gap: 5},
  statDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.btnRed},
  statText: {fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500'},
  statDivider: {width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.2)'},
});





