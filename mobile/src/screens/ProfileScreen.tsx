import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../theme';
import { openWhatsAppConcierge } from '../services/api';

export const ProfileScreen: React.FC = () => {
  const menuItems = [
    {
      icon: 'calendar',
      label: 'My VIP Bookings & Catering',
      badge: 'Active',
      action: () => Alert.alert('Bookings', 'You have 1 upcoming Villa Setup scheduled in Palm Jumeirah.'),
    },
    {
      icon: 'receipt',
      label: 'Order History & Invoices',
      action: () => Alert.alert('Orders', 'Order history retrieved from SheeshaTonight cloud.'),
    },
    {
      icon: 'location',
      label: 'Saved Delivery Addresses',
      desc: 'Palm Jumeirah, Downtown Dubai',
      action: () => Alert.alert('Addresses', 'Manage your saved villa, yacht and apartment pins.'),
    },
    {
      icon: 'shield-checkmark',
      label: 'Age & KYC Verification',
      badge: '21+ Verified',
      badgeColor: '#10B981',
      action: () => Alert.alert('Age Verification', 'Your profile is 21+ verified under UAE commercial regulations.'),
    },
    {
      icon: 'star',
      label: 'VIP Loyalty Rewards',
      desc: 'Tier: Gold Member (1,250 Pts)',
      action: () => Alert.alert('VIP Rewards', 'You earn 5% cashback on all sheesha catering bookings.'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>ACCOUNT & PRIVILEGES</Text>
        <Text style={styles.headerTitle}>VIP Profile</Text>
      </View>

      {/* Member Card with Gold Trim */}
      <View style={styles.memberCardContainer}>
        <LinearGradient
          colors={['#1E1628', '#140E1B']}
          style={styles.memberCard}
        >
          <View style={styles.memberCardTop}>
            <View>
              <Text style={styles.memberName}>His Highness / Guest User</Text>
              <Text style={styles.memberId}>VIP ID: ST-UAE-8921</Text>
            </View>
            <View style={styles.goldTierBadge}>
              <Ionicons name="diamond" size={14} color="#D4AF37" />
              <Text style={styles.goldTierText}>GOLD TIER</Text>
            </View>
          </View>

          <View style={styles.memberCardDivider} />

          <View style={styles.memberCardBottom}>
            <View>
              <Text style={styles.cardStatLabel}>MEMBER SINCE</Text>
              <Text style={styles.cardStatVal}>Dubai, 2024</Text>
            </View>
            <View>
              <Text style={styles.cardStatLabel}>PRIMARY REGION</Text>
              <Text style={styles.cardStatVal}>UAE & GCC</Text>
            </View>
            <View>
              <Text style={styles.cardStatLabel}>CONCIERGE</Text>
              <Text style={[styles.cardStatVal, { color: '#10B981' }]}>Priority 24/7</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 24/7 WhatsApp Hotline Card */}
      <TouchableOpacity
        style={styles.hotlineCard}
        onPress={() => openWhatsAppConcierge('Hi, I am calling on my Gold VIP Membership privileges.')}
        activeOpacity={0.85}
      >
        <View style={styles.hotlineIcon}>
          <Ionicons name="logo-whatsapp" size={26} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.hotlineTitle}>Direct WhatsApp Concierge</Text>
          <Text style={styles.hotlineSubtitle}>Instant assistance for bookings, flavors and custom events</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Menu List */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuRow}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon as any} size={18} color="#A855F7" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.desc && <Text style={styles.menuDesc}>{item.desc}</Text>}
            </View>
            {item.badge && (
              <View
                style={[
                  styles.badgeContainer,
                  { backgroundColor: item.badgeColor ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.badgeColor || '#D4AF37' },
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>SheeshaTonight Mobile v1.0.0 (UAE)</Text>
        <Text style={styles.footerLegal}>100% Genuine Imported Products • Licensed UAE Entity</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 1.5,
    ...FONTS.bold,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.text,
    marginVertical: 4,
    ...FONTS.heavy,
  },
  memberCardContainer: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  memberCard: {
    borderRadius: 22,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  memberCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberName: {
    fontSize: 16,
    color: COLORS.text,
    ...FONTS.bold,
  },
  memberId: {
    fontSize: 11,
    color: COLORS.gold,
    marginTop: 2,
    ...FONTS.semiBold,
  },
  goldTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  goldTierText: {
    color: '#D4AF37',
    fontSize: 10,
    ...FONTS.heavy,
  },
  memberCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  memberCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  cardStatVal: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
    ...FONTS.semiBold,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16281E',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    borderRadius: 18,
    marginHorizontal: SPACING.md,
    marginTop: 8,
    padding: 14,
  },
  hotlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineTitle: {
    color: COLORS.text,
    fontSize: 13,
    ...FONTS.bold,
  },
  hotlineSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: SPACING.md,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: COLORS.text,
    fontSize: 13,
    ...FONTS.semiBold,
  },
  menuDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    ...FONTS.bold,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerBrand: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...FONTS.medium,
  },
  footerLegal: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
  },
});
