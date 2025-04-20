import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Dummy Screens
const HomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>🏠 Home Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>👤 Profile Screen</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>⚙️ Settings Screen</Text>
  </View>
);

const EmployeeTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'settings'>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TabButton label="Home" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} />
          <TabButton label="Profile" isActive={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
          <TabButton label="Settings" isActive={activeTab === 'settings'} onPress={() => setActiveTab('settings')} />
        </View>
      </View>
    </View>
  );
};

// Custom Tab Button Component
type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.tabWrapper}>
    {isActive ? (
      <View style={styles.activeTabCircle}>
        <Text style={styles.activeText}>{label}</Text>
      </View>
    ) : (
      <Text style={styles.tabText}>{label}</Text>
    )}
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 22,
    fontWeight: '600',
  },
  tabBarContainer: {
    backgroundColor: '#f5e9e2', // Beige background
    paddingBottom: 20, // Space at the bottom
    paddingTop: 20, // Space for the circle
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5e9e2', // White tab bar
    marginHorizontal: 20, // Margin on the sides
    borderRadius: 30, // Rounded corners
    height: 50, // Height of the tab bar
    alignItems: 'center',
  },
  tabWrapper: {
    flex: 1, // Equal width for each tab
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontSize: 16,
    color: '#444',
  },
  activeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabCircle: {
    backgroundColor: '#1e3a8a', // Dark blue circle
    width: 70,
    height: 70,
    borderRadius: 35,
    position: 'absolute',
    top: -60, // Position to overlap the tab bar
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default EmployeeTab;