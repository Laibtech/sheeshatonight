import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../theme';
import { MOCK_RENTALS, openWhatsAppConcierge } from '../services/api';

export const RentalsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Villa' | 'Yacht' | 'Gala'>('All');

  const filtered = MOCK_RENTALS.filter((r) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Villa') return r.id.includes('villa');
    if (selectedFilter === 'Yacht') return r.id.includes('yacht');
    if (selectedFilter === 'Gala') return r.id.includes('royal') || r.id.includes('platinum');
    return true;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>WHITE-GLOVE UAE CATERING</Text>
        <Text style={styles.headerTitle}>VIP Sheesha Experiences</Text>
        <Text style={styles.headerDesc}>
          Certified Shisha Masters dispatched directly to your private villa, yacht or luxury venue with bespoke coals and flavors.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['All', 'Villa', 'Yacht', 'Gala'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterChip,
              selectedFilter === tab && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(tab)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === tab && styles.filterTextActive,
              ]}
            >
              {tab === 'All' ? 'All Packages' : `${tab} Setups`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rental Package Cards */}
      <View style={styles.packagesList}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.packageCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.packageImage} />
            {item.popular && (
              <View style={styles.popularBadge}>
                <Ionicons name="sparkles" size={11} color="#000000" />
                <Text style={styles.popularText}>DUBAI FAVORITE</Text>
              </View>
            )}

            <View style={styles.packageBody}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packageTitle}>{item.title}</Text>
                  <Text style={styles.packageSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>FROM</Text>
                  <Text style={styles.priceVal}>AED {item.price}</Text>
                </View>
              </View>

              {/* Meta stats */}
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.metaText}>{item.duration}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.metaText}>{item.guests}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Text style={[styles.metaText, { color: '#10B981' }]}>VIP Sommelier</Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {item.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() =>
                  openWhatsAppConcierge(
                    `Hi SheeshaTonight, I would like to book the "${item.title}" (AED ${item.price}) for my upcoming event in UAE.`
                  )
                }
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.bookButtonText}>Book VIP Setup Instantly</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    fontSize: 24,
    color: COLORS.text,
    marginVertical: 4,
    ...FONTS.heavy,
  },
  headerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...FONTS.semiBold,
  },
  filterTextActive: {
    color: '#FFFFFF',
    ...FONTS.bold,
  },
  packagesList: {
    paddingHorizontal: SPACING.md,
    gap: 20,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  packageImage: {
    width: '100%',
    height: 180,
  },
  popularBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  popularText: {
    color: '#000000',
    fontSize: 10,
    ...FONTS.heavy,
  },
  packageBody: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  packageTitle: {
    fontSize: 18,
    color: COLORS.text,
    ...FONTS.bold,
  },
  packageSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  priceVal: {
    fontSize: 18,
    color: COLORS.gold,
    ...FONTS.heavy,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  featuresContainer: {
    gap: 8,
    marginVertical: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...FONTS.bold,
  },
});
