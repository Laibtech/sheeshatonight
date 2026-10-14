import * as Linking from 'expo-linking';
import { Product, RentalPackage } from '../types';

// Default base URL for API (configured for dev machines / emulators)
export const API_BASE_URL = 'http://localhost:3000/api';

export const WHATSAPP_CONCIERGE_NUMBER = '971509121111';

export const openWhatsAppConcierge = async (messageText?: string) => {
  const defaultMsg = 'Hello SheeshaTonight Concierge! I would like to book a luxury sheesha experience / order in UAE.';
  const text = encodeURIComponent(messageText || defaultMsg);
  const url = `whatsapp://send?phone=${WHATSAPP_CONCIERGE_NUMBER}&text=${text}`;
  const webUrl = `https://wa.me/${WHATSAPP_CONCIERGE_NUMBER}?text=${text}`;

  const canOpen = await Linking.canOpenURL(url).catch(() => false);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(webUrl);
  }
};

export const MOCK_RENTALS: RentalPackage[] = [
  {
    id: 'silver-villa',
    title: 'Silver VIP Villa Setup',
    subtitle: 'Private Pool & Villa Gatherings',
    price: 750,
    duration: '4 Hours',
    guests: '1-5 Guests',
    tier: 'Silver',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800',
    features: [
      '2 Premium Luxury Hookahs',
      'Dedicated Sheesha Master',
      '4 Tobacco Flavors Included',
      'Unlimited Natural Coconut Coals',
      'Free VIP Setup & Delivery in Dubai',
    ],
  },
  {
    id: 'gold-yacht',
    title: 'Gold VIP Yacht & Penthouse',
    subtitle: 'Luxury Dubai Marina & Palm Jumeirah',
    price: 1450,
    duration: '6 Hours',
    guests: '5-12 Guests',
    tier: 'Gold',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    features: [
      '4 Custom Crystal Hookahs',
      '2 Dedicated Sheesha Sommelier Masters',
      'Unlimited Premium Imported Flavors',
      'Custom Fruit Heads (Pineapple/Grapefruit)',
      'Luxury Ice Tip Hoses',
      'Free Delivery across all UAE Emirates',
    ],
  },
  {
    id: 'platinum-royal',
    title: 'Platinum Royal Gala Setup',
    subtitle: 'Weddings, VIP Parties & Corporate Events',
    price: 2800,
    duration: '8 Hours',
    guests: '15-40 Guests',
    tier: 'Platinum',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    features: [
      '8 Designer Russian/German Hookahs',
      '3 Master Mixologists on-site',
      'Full Flavor Bar with 20+ Choices',
      'LED Glow Bases & Custom Ice Towers',
      'Zero-Clean Up White Glove Service',
    ],
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Wookah Master Crystal Oak',
    slug: 'wookah-master-crystal-oak',
    description: 'Authentic European hand-cut crystal glass and natural solid oak wood body. Supreme draw and luxury aesthetic.',
    price: 1850,
    compareAtPrice: 2200,
    category: 'Hookahs',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    vendorName: 'Dubai Luxury Hookahs',
    isPopular: true,
  },
  {
    id: 'prod-2',
    title: 'Al Fakher Double Apple VIP (1kg)',
    slug: 'al-fakher-double-apple-1kg',
    description: 'The definitive classic Middle Eastern aniseed and sweet apple blend. UAE authentic golden batch.',
    price: 240,
    category: 'Flavors',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800',
    rating: 5.0,
    reviewsCount: 128,
    inStock: true,
    vendorName: 'SheeshaTonight Official',
    isPopular: true,
  },
  {
    id: 'prod-3',
    title: 'Starbuzz Blue Mist Reserve (250g)',
    slug: 'starbuzz-blue-mist-250g',
    description: 'World-famous sweet blueberry with a refined, refreshing icy cooling exhale.',
    price: 110,
    compareAtPrice: 135,
    category: 'Flavors',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    rating: 4.8,
    reviewsCount: 95,
    inStock: true,
    vendorName: 'Smoke King Dubai',
    isPopular: true,
  },
  {
    id: 'prod-4',
    title: 'Kaloud Lotus I+ Heat Management System',
    slug: 'kaloud-lotus-i-plus',
    description: 'Precision aerospace-grade aluminum HMS that regulates heat transfer and eliminates charcoal taste.',
    price: 290,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    rating: 4.9,
    reviewsCount: 64,
    inStock: true,
    vendorName: 'Prime Accessories UAE',
  },
  {
    id: 'prod-5',
    title: 'CocoUrth Premium Coconut Charcoal (1kg Cube)',
    slug: 'cocourth-coconut-charcoal-1kg',
    description: '100% natural, odor-free, low-ash organic coconut cubes with 90+ minutes burn time.',
    price: 45,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800',
    rating: 4.9,
    reviewsCount: 210,
    inStock: true,
    vendorName: 'SheeshaTonight Official',
  },
];

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((p: any) => ({
          id: p.id,
          title: p.title || p.name,
          slug: p.slug || p.id,
          description: p.description || '',
          price: Number(p.price) || 0,
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          imageUrl: p.imageUrl || (p.images && p.images[0]) || MOCK_PRODUCTS[0].imageUrl,
          category: p.category?.name || 'Hookahs',
          rating: p.rating || 4.9,
          reviewsCount: p.reviewsCount || 10,
          inStock: p.inStock ?? true,
          vendorName: p.vendor?.name || 'SheeshaTonight',
        }));
      }
    }
  } catch (err) {
    // Graceful fallback to mock products for offline / simulator
  }
  return MOCK_PRODUCTS;
};
