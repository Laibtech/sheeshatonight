import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../theme';
import { useCart } from '../context/CartContext';
import { openWhatsAppConcierge } from '../services/api';

interface CartScreenProps {
  onNavigateToShop: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigateToShop }) => {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [selectedCity, setSelectedCity] = useState<'Dubai' | 'Abu Dhabi' | 'Sharjah'>('Dubai');

  const deliveryFee = subtotal >= 300 ? 0 : selectedCity === 'Dubai' ? 25 : 45;
  const total = subtotal + deliveryFee;

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;

    const itemsSummary = items
      .map((i) => `• ${i.quantity}x ${i.product.title} (AED ${i.product.price * i.quantity})`)
      .join('\n');

    const msg = `👑 *New VIP SheeshaTonight Order*\n\n${itemsSummary}\n\n*Subtotal:* AED ${subtotal}\n*Delivery City:* ${selectedCity} (AED ${deliveryFee})\n*Total:* AED ${total}\n\nPlease confirm my delivery slot and address!`;

    openWhatsAppConcierge(msg);
  };

  const handleDirectOrder = () => {
    Alert.alert(
      'Order Received!',
      `Thank you! Your order for AED ${total} in ${selectedCity} has been scheduled. Our concierge is preparing your setup.`,
      [
        {
          text: 'Open WhatsApp Support',
          onPress: handleCheckoutWhatsApp,
        },
        {
          text: 'Done',
          onPress: clearCart,
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="bag-handle-outline" size={48} color="#D4AF37" />
        </View>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Explore Dubai's finest sheesha setups, luxury European hookahs, and imported premium tobacco flavors.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={onNavigateToShop}
          activeOpacity={0.85}
        >
          <Text style={styles.browseButtonText}>Explore Store Catalog</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>CHECKOUT & REVIEW</Text>
        <Text style={styles.headerTitle}>Shopping Cart ({items.length})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {items.map(({ product, quantity }) => (
            <View key={product.id} style={styles.itemCard}>
              <Image source={{ uri: product.imageUrl }} style={styles.itemThumb} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>{product.title}</Text>
                <Text style={styles.itemVendor}>{product.vendorName}</Text>
                <Text style={styles.itemPrice}>AED {product.price}</Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product.id, quantity - 1)}
                  >
                    <Ionicons name="remove" size={14} color="#CBD5E1" />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product.id, quantity + 1)}
                  >
                    <Ionicons name="add" size={14} color="#CBD5E1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(product.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* City Selector */}
        <View style={styles.cityCard}>
          <Text style={styles.cardSectionTitle}>Select Delivery Emirate</Text>
          <View style={styles.cityRow}>
            {(['Dubai', 'Abu Dhabi', 'Sharjah'] as const).map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityChip,
                  selectedCity === city && styles.cityChipActive,
                ]}
                onPress={() => setSelectedCity(city)}
              >
                <Text
                  style={[
                    styles.cityText,
                    selectedCity === city && styles.cityTextActive,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {subtotal >= 300 ? (
            <View style={styles.freeDeliveryBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.freeDeliveryText}>You qualified for FREE VIP delivery!</Text>
            </View>
          ) : (
            <Text style={styles.deliveryNote}>Free delivery on orders AED 300+</Text>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardSectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>AED {subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery ({selectedCity})</Text>
            <Text style={[styles.summaryVal, deliveryFee === 0 && { color: '#10B981' }]}>
              {deliveryFee === 0 ? 'FREE' : `AED ${deliveryFee}`}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total (Incl. VAT)</Text>
            <Text style={styles.totalVal}>AED {total}</Text>
          </View>
        </View>

        {/* Checkout Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleDirectOrder}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Confirm Order (AED {total})</Text>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsAppOrderBtn}
            onPress={handleCheckoutWhatsApp}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.whatsAppOrderText}>Order via WhatsApp Concierge</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
  scrollContent: {
    padding: SPACING.md,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  itemThumb: {
    width: 75,
    height: 75,
    borderRadius: 14,
    backgroundColor: '#1E1E28',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 13,
    ...FONTS.bold,
  },
  itemVendor: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  itemPrice: {
    color: COLORS.gold,
    fontSize: 13,
    ...FONTS.heavy,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: COLORS.text,
    fontSize: 12,
    ...FONTS.bold,
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  cityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.md,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardSectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 10,
    ...FONTS.bold,
  },
  cityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  cityChipActive: {
    backgroundColor: 'rgba(138, 43, 226, 0.25)',
    borderColor: COLORS.primaryLight,
  },
  cityText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...FONTS.semiBold,
  },
  cityTextActive: {
    color: '#FFFFFF',
    ...FONTS.bold,
  },
  freeDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  freeDeliveryText: {
    color: '#10B981',
    fontSize: 11,
    ...FONTS.semiBold,
  },
  deliveryNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.md,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  summaryVal: {
    color: COLORS.text,
    fontSize: 13,
    ...FONTS.semiBold,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 15,
    ...FONTS.heavy,
  },
  totalVal: {
    color: COLORS.gold,
    fontSize: 18,
    ...FONTS.heavy,
  },
  actionButtons: {
    gap: 10,
    marginTop: 20,
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...FONTS.bold,
  },
  whatsAppOrderBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.4)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsAppOrderText: {
    color: '#25D366',
    fontSize: 14,
    ...FONTS.bold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    marginBottom: 6,
    ...FONTS.bold,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...FONTS.bold,
  },
});
