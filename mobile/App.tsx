import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from './src/theme';
import { CartProvider, useCart } from './src/context/CartContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { RentalsScreen } from './src/screens/RentalsScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { CartScreen } from './src/screens/CartScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { openWhatsAppConcierge } from './src/services/api';

type TabType = 'home' | 'rentals' | 'shop' | 'cart' | 'profile';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { totalCount } = useCart();
  const insets = useSafeAreaInsets();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToRentals={() => setActiveTab('rentals')}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        );
      case 'rentals':
        return <RentalsScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'cart':
        return <CartScreen onNavigateToShop={() => setActiveTab('shop')} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateToRentals={() => setActiveTab('rentals')}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        );
    }
  };

  const tabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: 'flame' },
    { id: 'rentals', label: 'Rentals', icon: 'sparkles' },
    { id: 'shop', label: 'Shop', icon: 'bag-handle' },
    { id: 'cart', label: 'Cart', icon: 'cart', badge: totalCount },
    { id: 'profile', label: 'VIP', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Screen Body */}
      <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
        {renderScreen()}
      </View>

      {/* Floating Instant WhatsApp Button (when not on Cart) */}
      {activeTab !== 'cart' && (
        <TouchableOpacity
          style={[styles.floatingWhatsApp, { bottom: insets.bottom + 65 }]}
          onPress={() => openWhatsAppConcierge()}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Luxury Bottom Tab Navigation Bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tabIconWrapper}>
                <Ionicons
                  name={isActive ? tab.icon : (`${tab.icon}-outline` as any)}
                  size={22}
                  color={isActive ? COLORS.primaryLight : '#9CA3AF'}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge && tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(19, 19, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    ...FONTS.semiBold,
  },
  tabLabelActive: {
    color: COLORS.primaryLight,
    ...FONTS.bold,
  },
  tabLabelInactive: {
    color: '#9CA3AF',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryLight,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    ...FONTS.bold,
  },
  floatingWhatsApp: {
    position: 'absolute',
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
});
