// src/westwalk/screens/Maintenance/MaintenanceTab.tsx
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../../theme/Colors';
import MaintainceRequest from './MaintainceRequest';
import MyRequests from './MyRequests';

const TABS = ['New Request', 'My Requests'] as const;
type TabType = typeof TABS[number];

const {width: SCREEN_W} = Dimensions.get('window');

const MaintenanceTab = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('New Request');
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: TabType) => {
    const idx = TABS.indexOf(tab);
    Animated.spring(indicatorAnim, {
      toValue: idx,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
    setActiveTab(tab);
  };

  // tabWidth = total screen - 32 (side paddings) - 8 (inner padding 4+4) / 2 tabs
  const TAB_BAR_INNER_W = SCREEN_W - 32 - 8;
  const tabWidth = TAB_BAR_INNER_W / 2;

  const indicatorTranslate = indicatorAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, tabWidth],
  });

  return (
    // ✅ SafeAreaView edges top only — fills notch with PrimaryColor
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.PrimaryColor}
        barStyle="light-content"
      />

      {/* ── Green header ── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Maintenance</Text>
        <Text style={styles.pageSubtitle}>Submit or track your requests</Text>
      </View>

      {/* ── Body — Bg color ── */}
      <View style={styles.body}>

        {/* ── Tab bar ── */}
        <View style={styles.tabBarWrap}>
          <View style={styles.tabBar}>
            {/* Animated sliding indicator */}
            <Animated.View
              style={[
                styles.tabIndicator,
                {width: tabWidth, transform: [{translateX: indicatorTranslate}]},
              ]}
            />
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => switchTab(tab)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab && styles.tabLabelActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Screen content ── */}
        <View style={styles.content}>
          {activeTab === 'New Request' ? (
            <MaintainceRequest navigation={navigation} />
          ) : (
            <MyRequests />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ✅ SafeAreaView = PrimaryColor — top notch matches green header
  safe: {
    flex: 1,
    backgroundColor: Colors.PrimaryColor,

  },

  // ── Green header ──
  pageHeader: {
    height:Platform.OS === 'ios' ? 110 : 100,
    backgroundColor:Colors.PrimaryColor,
    justifyContent:'flex-end',
    paddingHorizontal: '5%',
    paddingBottom:10
   
    
    // backgroundColor: Colors.PrimaryColor,
    // paddingHorizontal: 16,
    // paddingTop: 10,
    // paddingBottom: 18,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.White,       // ✅ White on green
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)', // ✅ Soft white
    marginTop: 3,
  },

  // ✅ Body fills rest of screen with Bg color
  body: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },

  // ── Tab bar ──
  tabBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    height: 44,             // ✅ Fixed height — indicator fills correctly
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 36,             // ✅ 44 - (4 top + 4 bottom padding) = 36
    backgroundColor: Colors.PrimaryColor,
    borderRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,              // ✅ Above indicator
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.Grey,
  },
  tabLabelActive: {
    color: Colors.White,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },
});

export default MaintenanceTab;
