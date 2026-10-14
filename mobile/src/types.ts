export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  category: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  vendorName: string;
  isPopular?: boolean;
}

export interface RentalPackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  duration: string;
  guests: string;
  imageUrl: string;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Royal';
  features: string[];
  popular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  isAgeVerified: boolean;
}
