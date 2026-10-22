"use client";

import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react";
import "./cart.css";

const formatPrice = (val: number | null | undefined): string => {
  const num = Number(val);
  return Number.isFinite(num) ? num.toFixed(2) : "Unavailable";
};

export default function CartPage() {
  const { cart, loading, itemCount, updateQuantity, removeItem, clearCart } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm("Remove this item from cart?")) {
      await removeItem(itemId);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Clear entire cart?")) {
      await clearCart();
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-page">
          <div className="cart-container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <>
        <Header />
        <div className="cart-page">
          <div className="cart-container">
            <div className="empty-cart">
              <div className="empty-icon">
                <ShoppingBag size={80} />
              </div>
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven&apos;t added anything to your cart yet.</p>
              <Link href="/shop" className="shop-now-btn">
                <ShoppingBag size={20} />
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const cartIsValid = cart.invalidItemCount === 0;
  const subtotalNum = cartIsValid ? cart.subtotal : null;
  const totalNum = cartIsValid ? cart.total : null;

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="cart-container">
          {/* Header */}
          <div className="cart-header">
            <div className="cart-title-section">
              <h1>Shopping Cart</h1>
              <span className="cart-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            </div>
            <button onClick={handleClearCart} className="clear-cart-btn">
              <Trash2 size={18} />
              Clear Cart
            </button>
          </div>

          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items-section">
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="product-img"
                      unoptimized
                    />
                  </div>

                  <div className="item-details">
                    <Link
                      href={
                        item.category === "RENTAL_PACKAGE" ||
                        item.category === "RENTAL" ||
                        item.productId.includes("-")
                          ? `/rentals/${item.productId}`
                          : `/products/${item.productId}`
                      }
                      className="item-name"
                    >
                      {item.name}
                    </Link>
                    <p className="item-vendor">{item.vendor}</p>
                    <p className="item-category">
                      {item.category === "RENTAL_PACKAGE" ? "Sheesha Rental Package" : item.category}
                    </p>
                    <p className="item-price">
                      {item.price === null ? "Price unavailable" : `AED ${formatPrice(item.price)}`}
                    </p>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="qty-btn"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Total:</span>
                      <span className="total-price">
                        {item.price === null ? "Unavailable" : `AED ${formatPrice(item.price * item.quantity)}`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>AED {formatPrice(subtotalNum)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-shipping">Included</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{totalNum === null ? "Unavailable" : `AED ${formatPrice(totalNum)}`}</span>
              </div>

              {cartIsValid ? (
                <Link href="/checkout" className="checkout-btn">
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <p className="checkout-btn" role="alert">
                  Remove unavailable items to continue
                </p>
              )}

              <Link href="/shop" className="continue-shopping">
                <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
                Continue Shopping
              </Link>

              <div className="trust-badges">
                <div className="trust-item">
                  <Package size={24} />
                  <span>Secure Checkout</span>
                </div>
                <div className="trust-item">
                  <Package size={24} />
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
