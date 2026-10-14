import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../theme';
import { MOCK_PRODUCTS } from '../services/api';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 2 - 12) / 2;

export const ShopScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  const categories = ['All', 'Flavors', 'Hookahs', 'Accessories'];

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>PREMIUM CATALOG</Text>
        <Text style={styles.headerTitle}>Shop Hookahs & Flavors</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search double apple, crystal hookahs, coals..."
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        <View style={styles.grid}>
          {filteredProducts.map((product) => {
            const isJustAdded = addedId === product.id;
            return (
              <View key={product.id} style={styles.card}>
                <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />

                {product.compareAtPrice && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>SAVE AED {product.compareAtPrice - product.price}</Text>
                  </View>
                )}

                <View style={styles.cardBody}>
                  <Text style={styles.vendorText} numberOfLines={1}>{product.vendorName}</Text>
                  <Text style={styles.titleText} numberOfLines={2}>{product.title}</Text>

                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{product.rating} ({product.reviewsCount})</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceText}>AED {product.price}</Text>
                      {product.compareAtPrice && (
                        <Text style={styles.comparePriceText}>AED {product.compareAtPrice}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.addBtn,
                        isJustAdded && { backgroundColor: '#10B981' },
                      ]}
                      onPress={() => handleAddToCart(product)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isJustAdded ? 'checkmark' : 'bag-add'}
                        size={17}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or category filter</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  categoriesScroll: {
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...FONTS.semiBold,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    ...FONTS.bold,
  },
  gridContainer: {
    padding: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#1E1E28',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 8,
    ...FONTS.heavy,
  },
  cardBody: {
    padding: 10,
  },
  vendorText: {
    color: COLORS.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  titleText: {
    color: COLORS.text,
    fontSize: 12,
    marginVertical: 4,
    height: 32,
    ...FONTS.semiBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: COLORS.gold,
    fontSize: 14,
    ...FONTS.heavy,
  },
  comparePriceText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: 12,
    ...FONTS.bold,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
