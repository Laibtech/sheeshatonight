import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../theme';
import { MOCK_RENTALS, MOCK_PRODUCTS, openWhatsAppConcierge } from '../services/api';
import { useCart } from '../context/CartContext';
import { Product, RentalPackage } from '../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigateToRentals: () => void;
  onNavigateToShop: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToRentals,
  onNavigateToShop,
}) => {
  const { addItem } = useCart();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* VIP Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>MARHABA & WELCOME</Text>
          <Text style={styles.headerTitle}>SheeshaTonight</Text>
        </View>
        <TouchableOpacity
          style={styles.conciergeBadge}
          onPress={() => openWhatsAppConcierge('Hi SheeshaTonight, I would like to speak to a VIP concierge.')}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={styles.conciergeBadgeText}>VIP Concierge</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner with Luxury Gradient */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={['#74189B', '#4A0E63', '#1A0625']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.pillTag}>
              <Ionicons name="sparkles" size={12} color="#D4AF37" />
              <Text style={styles.pillText}>UAE'S #1 PREMIER HOOKAH SERVICE</Text>
            </View>
            <Text style={styles.heroTitle}>Luxury Sheesha at Your Doorstep</Text>
            <Text style={styles.heroSubtitle}>
              Private Villas, Luxury Yachts & VIP Events across Dubai & Abu Dhabi.
            </Text>

            <View style={styles.heroButtonsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNavigateToRentals}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Book VIP Rental</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => openWhatsAppConcierge()}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={styles.secondaryButtonText}>Instant Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={onNavigateToRentals}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(116, 24, 155, 0.25)' }]}>
            <Ionicons name="flame" size={22} color="#A855F7" />
          </View>
          <Text style={styles.quickActionTitle}>VIP Setups</Text>
          <Text style={styles.quickActionDesc}>Villa & Yacht</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={onNavigateToShop}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
            <Ionicons name="bag-handle" size={22} color="#D4AF37" />
          </View>
          <Text style={styles.quickActionTitle}>Shop Flavors</Text>
          <Text style={styles.quickActionDesc}>100+ Brands</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => openWhatsAppConcierge('Hi, I need urgent Sheesha delivery in Dubai tonight!')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(37, 211, 102, 0.2)' }]}>
            <Ionicons name="flash" size={22} color="#25D366" />
          </View>
          <Text style={styles.quickActionTitle}>Fast Delivery</Text>
          <Text style={styles.quickActionDesc}>60-90 Min</Text>
        </TouchableOpacity>
      </View>

      {/* Featured VIP Rental Setups (Horizontal Scroll) */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Catering & Rental Experiences</Text>
          <Text style={styles.sectionSubtitle}>Turnkey setup with certified Shisha Masters</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToRentals}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {MOCK_RENTALS.map((rental) => (
          <TouchableOpacity
            key={rental.id}
            style={styles.rentalCard}
            onPress={() => openWhatsAppConcierge(`Hi, I would like to book the ${rental.title} (AED ${rental.price}).`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: rental.imageUrl }} style={styles.rentalImage} />
            <LinearGradient
              colors={['transparent', 'rgba(11,11,14,0.95)']}
              style={styles.rentalOverlay}
            >
              {rental.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <Text style={styles.rentalTitle}>{rental.title}</Text>
              <Text style={styles.rentalGuests}>
                <Ionicons name="people" size={12} color="#9CA3AF" /> {rental.guests} • {rental.duration}
              </Text>
              <View style={styles.rentalBottomRow}>
                <Text style={styles.rentalPrice}>AED {rental.price}</Text>
                <View style={styles.bookBadge}>
                  <Text style={styles.bookBadgeText}>Book Now</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Popular Flavors & Products */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Bestselling Flavors & Hookahs</Text>
          <Text style={styles.sectionSubtitle}>Top rated by Dubai enthusiasts</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToShop}>
          <Text style={styles.seeAllText}>Explore Store</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsList}>
        {MOCK_PRODUCTS.slice(0, 4).map((product) => (
          <View key={product.id} style={styles.productRow}>
            <Image source={{ uri: product.imageUrl }} style={styles.productThumb} />
            <View style={styles.productInfo}>
              <Text style={styles.productVendor}>{product.vendorName}</Text>
              <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
              <View style={styles.productRatingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.productRating}>{product.rating} ({product.reviewsCount})</Text>
              </View>
              <Text style={styles.productPrice}>AED {product.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => addItem(product)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 24/7 VIP WhatsApp Assistance Banner */}
      <TouchableOpacity
        style={styles.vipBanner}
        onPress={() => openWhatsAppConcierge('Hi SheeshaTonight, I need personalized flavor recommendations!')}
        activeOpacity={0.85}
      >
        <View style={styles.vipBannerContent}>
          <Ionicons name="chatbubbles" size={28} color="#D4AF37" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.vipBannerTitle}>Need Custom Recommendations?</Text>
            <Text style={styles.vipBannerDesc}>Chat directly with our UAE Shisha Sommeliers 24/7</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerGreeting: {
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 1.5,
    ...FONTS.bold,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.text,
    ...FONTS.heavy,
  },
  conciergeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  conciergeBadgeText: {
    color: '#25D366',
    fontSize: 12,
    ...FONTS.semiBold,
  },
  heroCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#74189B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: SPACING.lg,
  },
  heroContent: {},
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  pillText: {
    color: '#D4AF37',
    fontSize: 10,
    letterSpacing: 0.5,
    ...FONTS.bold,
  },
  heroTitle: {
    fontSize: 22,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: 6,
    ...FONTS.heavy,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 18,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#8A2BE2',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...FONTS.bold,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...FONTS.semiBold,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    color: COLORS.text,
    fontSize: 12,
    marginBottom: 2,
    ...FONTS.bold,
  },
  quickActionDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    color: COLORS.text,
    ...FONTS.bold,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    ...FONTS.semiBold,
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: 14,
  },
  rentalCard: {
    width: width * 0.72,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  rentalImage: {
    width: '100%',
    height: '100%',
  },
  rentalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 14,
    justifyContent: 'flex-end',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: '#000000',
    fontSize: 9,
    ...FONTS.heavy,
  },
  rentalTitle: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 2,
    ...FONTS.bold,
  },
  rentalGuests: {
    color: '#CBD5E1',
    fontSize: 11,
    marginBottom: 8,
  },
  rentalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalPrice: {
    color: COLORS.gold,
    fontSize: 16,
    ...FONTS.heavy,
  },
  bookBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bookBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    ...FONTS.bold,
  },
  productsList: {
    paddingHorizontal: SPACING.md,
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  productThumb: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#20202A',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productVendor: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  productTitle: {
    color: COLORS.text,
    fontSize: 13,
    marginVertical: 2,
    ...FONTS.semiBold,
  },
  productRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productRating: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  productPrice: {
    color: COLORS.gold,
    fontSize: 14,
    marginTop: 2,
    ...FONTS.bold,
  },
  addToCartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipBanner: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 18,
    padding: 14,
  },
  vipBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipBannerTitle: {
    color: COLORS.text,
    fontSize: 13,
    ...FONTS.bold,
  },
  vipBannerDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
