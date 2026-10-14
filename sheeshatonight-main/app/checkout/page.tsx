"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import {
  Wallet,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Lock,
  CreditCard,
} from 'lucide-react';
import './checkout.css';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const formatPrice = (val: number | undefined | null): string => {
  const num = Number(val);
  return Number.isFinite(num) ? num.toFixed(2) : "Unavailable";
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { cart, loading, clearCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [notes, setNotes] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: 'Dubai',
    state: 'Dubai',
    zipCode: '',
    country: 'UAE',
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: 'Dubai',
    state: 'Dubai',
    zipCode: '',
    country: 'UAE',
  });
  const cartIsValid = cart.invalidItemCount === 0;

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cart.items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [loading, cart.items.length, orderPlaced, router]);

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setShippingAddress((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof ShippingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.firstName || !shippingAddress.lastName) {
      alert('Please enter your full name');
      return false;
    }
    if (!shippingAddress.phone) {
      alert('Please enter your phone number');
      return false;
    }
    if (!shippingAddress.street || !shippingAddress.city) {
      alert('Please enter complete shipping address');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please sign in or create an account to complete your order.');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (!validateForm()) return;
    if (!cartIsValid) {
      alert('One or more cart items have an unavailable price. Please return to the cart and remove them.');
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === 'CARD') {
        const stripeRes = await fetch('/api/payments/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const stripeData = await stripeRes.json();
        if (stripeData.success && stripeData.url) {
          window.location.href = stripeData.url;
          return;
        } else {
          alert(stripeData.error || 'Online card payment gateway is currently offline. Please use Cash on Delivery.');
          setProcessing(false);
          return;
        }
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          billingAddress: sameAsBilling ? shippingAddress : billingAddress,
          paymentMethod,
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderPlaced(true);
        // Clear cart context
        await clearCart();
        
        // Redirect to success page
        router.push(`/order-success?orders=${result.data.orders.map((o: any) => o.orderNumber).join(',')}`);
      } else {
        alert(result.error || 'Failed to place order');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="checkout-container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading checkout...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const subtotalNum = cartIsValid ? cart.subtotal : null;
  const totalAmount = cartIsValid ? cart.total : null;

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="checkout-container">
          {/* Header */}
          <div className="checkout-header">
            <button onClick={() => router.back()} className="back-btn">
              <ArrowLeft size={20} />
              Back to Cart
            </button>
            <h1>Checkout</h1>
            <div className="secure-badge">
              <Lock size={16} />
              Secure Checkout
            </div>
          </div>

          <div className="checkout-content">
            {/* Left Side - Forms */}
            <div className="checkout-forms">
              {!user && (
                <div style={{ background: "#FDF4FF", border: "1px solid #F0ABFC", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: "#74189B", fontSize: "14px", fontWeight: "500" }}>
                    Already have an account? Sign in to track orders and checkout faster.
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/login?redirect=/checkout')}
                    style={{ background: "#74189B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Shipping Address */}
              <div className="form-section">
                <div className="section-header">
                  <MapPin size={24} />
                  <h2>Shipping Address</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      placeholder="Enter email"
                      disabled={false}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => handleShippingChange('street', e.target.value)}
                      placeholder="Building name, street, area"
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <select
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                    >
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <div className="section-header">
                  <Wallet size={24} />
                  <h2>Payment Method</h2>
                </div>

                <div className="payment-methods">
                  <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <Wallet size={24} />
                      <div>
                        <h3>Cash on Delivery</h3>
                        <p>Pay with cash or card upon delivery</p>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <CreditCard size={24} />
                      <div>
                        <h3>Credit / Debit Card (Online)</h3>
                        <p>Secure payment powered by Stripe</p>
                      </div>
                    </div>
                  </label>

                </div>
              </div>

              {/* Order Notes */}
              <div className="form-section">
                <div className="section-header">
                  <h2>Order Notes (Optional)</h2>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..."
                  rows={4}
                  className="notes-textarea"
                />
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="order-summary-checkout">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-img">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        unoptimized
                      />
                      <span className="item-qty">{item.quantity}</span>
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-price">
                        {item.price === null ? 'Price unavailable' : `AED ${formatPrice(item.price * item.quantity)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>AED {formatPrice(subtotalNum)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="free">Included</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{totalAmount === null ? 'Unavailable' : `AED ${formatPrice(totalAmount)}`}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing || !cartIsValid}
                className="place-order-btn"
              >
                {processing ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Place Order
                  </>
                )}
              </button>

              <div className="secure-note">
                <Lock size={16} />
                <span>Your payment information is secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
