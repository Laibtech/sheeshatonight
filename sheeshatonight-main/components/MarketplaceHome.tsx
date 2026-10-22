'use client';

import './MarketplaceHome.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Heart, MapPin, ShieldCheck, ShoppingBag, Star, Truck, Users, Zap } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  id: string;
  title?: string;
  name?: string;
  price?: number | string;
  images?: string[] | string;
  image?: string;
  vendor?: string;
  vendorLocation?: string;
  stock?: number;
}

interface Vendor {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

const categories = [
  { title: 'Sheesha Flavors', text: 'Premium blends for every mood.', image: '/Categories/flavor.webp', href: '/categories/flavors' },
  { title: 'Sheesha Setups', text: 'Curated pieces made to impress.', image: '/Categories/Sheesha Setups.webp', href: '/categories/sheesha-setups' },
  { title: 'Accessories', text: 'The finishing touches for your setup.', image: '/Categories/Accessories.webp', href: '/categories/accessories' },
  { title: 'Rent a Sheesha', text: 'Delivered experiences for every occasion.', image: '/Categories/Rentals.webp', href: '/rentals' },
  { title: 'Buy Sheesha', text: 'Bring the lounge home.', image: '/Categories/Buy Sheesha.webp', href: '/categories/buy-sheesha' },
  { title: 'Premium Packages', text: 'Elevated event-ready collections.', image: '/gold.webp', href: '/make-your-sheesha' },
];

const occasions = [
  { title: 'Villa Experiences', image: '/Rent aur Buy banners/Rent-banners.webp', href: '/rentals' },
  { title: 'Yacht Evenings', image: '/lounge-1.webp', href: '/rentals' },
  { title: 'Corporate Events', image: '/hero-banner.png', href: '/rentals' },
  { title: 'Private Gatherings', image: '/platinum.webp', href: '/rentals' },
];

function imageFrom(product: Product) {
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      if (product.images) return product.images;
    }
  }
  return '/hero-banner.png';
}

function ProductCard({ product }: { product: Product }) {
  const title = product.title || product.name || 'Premium Sheesha Product';
  const price = Number(product.price || 0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <article className="market-product-card">
      <div className="market-product-image">
        <img src={imageFrom(product)} alt={title} onError={(event) => { event.currentTarget.src = '/hero-banner.png'; }} />
        <button
          type="button"
          className="market-wishlist"
          onClick={() =>
            toggleWishlist(product.id, {
              title,
              name: title,
              price,
              image: imageFrom(product),
              vendor: product.vendor,
            })
          }
          aria-label={`Save ${title}`}
          style={{ cursor: 'pointer' }}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#74189B] text-[#74189B]' : 'text-slate-500'}`} />
        </button>
      </div>
      <div className="market-product-body">
        <p className="market-product-vendor">{product.vendor || 'Verified vendor'}</p>
        <h3>{title}</h3>
        <div className="market-product-meta"><span><Star className="w-3.5 h-3.5 fill-current" /> 4.8</span><span>{product.stock && product.stock > 0 ? 'Available' : 'Check availability'}</span></div>
        <div className="market-product-footer"><strong>AED {price.toFixed(2)}</strong><Link href={`/products/${product.id}`}>View <ArrowRight className="w-3.5 h-3.5" /></Link></div>
      </div>
    </article>
  );
}

export default function MarketplaceHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=8').then((response) => response.json()),
      fetch('/api/vendors?limit=4').then((response) => response.json()),
    ]).then(([productResult, vendorResult]) => {
      if (productResult.success && Array.isArray(productResult.data)) setProducts(productResult.data);
      if (vendorResult.success && Array.isArray(vendorResult.data)) setVendors(vendorResult.data);
    }).catch(() => {});
  }, []);

  return (
    <main className="market-home">
      <section className="market-hero">
        <div className="market-hero-copy">
          <p className="market-eyebrow">PREMIUM UAE SHEESHA MARKETPLACE</p>
          <h1>Premium Sheesha, delivered to your experience.</h1>
          <p className="market-hero-text">Discover premium products, curated rentals and unforgettable experiences across the UAE.</p>
          <div className="market-hero-actions"><Link href="/rentals" className="market-button market-button-primary">Explore Rentals <ArrowRight className="w-4 h-4" /></Link><Link href="/shop" className="market-button market-button-secondary">Shop Sheesha</Link></div>
          <div className="market-trust-line"><span><CheckCircle2 className="w-4 h-4" /> Verified vendors</span><span><CheckCircle2 className="w-4 h-4" /> Premium quality</span><span><CheckCircle2 className="w-4 h-4" /> UAE-wide service</span></div>
        </div>
        <div className="market-hero-media"><img src="/hero-banner.png" alt="Premium sheesha setup" /></div>
      </section>

      <section className="market-section market-section-tight"><div className="market-section-heading"><div><p className="market-eyebrow">EXPLORE SHEESHATONIGHT</p><h2>Everything for your next sheesha moment.</h2></div><Link href="/shop" className="market-text-link">Shop all <ArrowRight className="w-4 h-4" /></Link></div><div className="market-category-grid">{categories.map((category) => <Link href={category.href} className="market-category-card" key={category.title}><img src={category.image} alt="" /><div><h3>{category.title}</h3><p>{category.text}</p><span>Explore <ArrowRight className="w-4 h-4" /></span></div></Link>)}</div></section>

      <section className="market-section market-section-tinted"><div className="market-section-heading"><div><p className="market-eyebrow">CURATED FOR YOUR OCCASION</p><h2>Make every occasion better.</h2></div><Link href="/rentals" className="market-text-link">View rentals <ArrowRight className="w-4 h-4" /></Link></div><div className="market-occasion-grid">{occasions.map((occasion) => <Link href={occasion.href} className="market-occasion-card" key={occasion.title}><img src={occasion.image} alt="" /><span>{occasion.title}</span><ArrowRight className="w-5 h-5" /></Link>)}</div></section>

      <section className="market-section"><div className="market-section-heading"><div><p className="market-eyebrow">LIVE MARKETPLACE</p><h2>Best sellers from real vendors.</h2></div><Link href="/shop" className="market-text-link">Browse shop <ArrowRight className="w-4 h-4" /></Link></div>{products.length > 0 ? <div className="market-product-grid">{products.slice(0, 8).map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="market-empty"><ShoppingBag className="w-7 h-7" /><p>Products will appear here as vendors add their real catalog.</p><Link href="/shop">Visit the shop <ArrowRight className="w-4 h-4" /></Link></div>}</section>

      <section className="market-how"><div className="market-section-heading"><div><p className="market-eyebrow">SIMPLE BY DESIGN</p><h2>Your sheesha experience, simplified.</h2></div></div><div className="market-steps"><div><span>01</span><h3>Choose</h3><p>Explore premium products, rentals and experiences.</p></div><div><span>02</span><h3>Book</h3><p>Select your date, time and preferred setup.</p></div><div><span>03</span><h3>Enjoy</h3><p>Our verified vendors handle the rest.</p></div></div></section>

      <section className="market-section"><div className="market-section-heading"><div><p className="market-eyebrow">TRUSTED LOCALLY</p><h2>Meet our verified vendors.</h2></div><Link href="/vendors" className="market-text-link">Explore vendors <ArrowRight className="w-4 h-4" /></Link></div>{vendors.length > 0 ? <div className="market-vendor-grid">{vendors.map((vendor) => <Link href={`/vendors/${vendor.id}`} className="market-vendor-card" key={vendor.id}><div className="market-vendor-avatar"><Users className="w-6 h-6" /></div><div><h3>{vendor.name}</h3><p><MapPin className="w-3.5 h-3.5" /> {vendor.location || 'UAE'}</p><span><ShieldCheck className="w-3.5 h-3.5" /> Verified vendor</span></div><ArrowRight className="w-5 h-5" /></Link>)}</div> : <div className="market-empty"><Users className="w-7 h-7" /><p>Verified vendor profiles will appear here as the marketplace grows.</p></div>}</section>

      <section className="market-benefits"><div className="market-section-heading"><div><p className="market-eyebrow">THE SHEESHATONIGHT STANDARD</p><h2>Premium from discovery to delivery.</h2></div></div><div className="market-benefit-grid"><div><ShieldCheck /><h3>Verified vendors</h3><p>Trusted marketplace partners for every order.</p></div><div><Truck /><h3>UAE-wide service</h3><p>Premium delivery and setup across the Emirates.</p></div><div><Zap /><h3>Fast support</h3><p>Thoughtful help before, during and after your experience.</p></div></div></section>

      <section className="market-final-cta"><p className="market-eyebrow">YOUR NEXT MOMENT STARTS HERE</p><h2>Ready for your next sheesha experience?</h2><p>From relaxed evenings to unforgettable celebrations, find everything you need with SheeshaTonight.</p><div className="market-hero-actions"><Link href="/rentals" className="market-button market-button-primary">Book a rental</Link><Link href="/shop" className="market-button market-button-secondary">Shop now</Link></div></section>
    </main>
  );
}
