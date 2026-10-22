'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowUpRight,
  Search,
  FileText,
  X,
  Store,
  RefreshCw,
} from 'lucide-react';
import { TaxInvoiceModal, TaxInvoiceData } from '@/components/TaxInvoiceModal';

interface OrderItemProduct {
  id?: string;
  productName: string;
  quantity: number;
  price: number;
}

interface RawOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  vendor: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: string;
  items?: OrderItemProduct[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    issuedAt: string;
  };
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (token) return token;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

const formatAmount = (value: unknown, currency = 'AED'): string => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${currency} ${amount.toFixed(2)}` : 'AED 0.00';
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal & Invoice Modal state
  const [activeOrder, setActiveOrder] = useState<RawOrder | null>(null);
  const [invoiceData, setInvoiceData] = useState<TaxInvoiceData | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/orders', {
        headers,
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items &&
          order.items.some((i) =>
            (i.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
          ));

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ACTIVE') {
        return ['PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'ACTIVE_RENTAL'].includes(
          (order.status || '').toUpperCase()
        );
      }
      if (statusFilter === 'DELIVERED') {
        return ['DELIVERED', 'COMPLETED'].includes((order.status || '').toUpperCase());
      }
      if (statusFilter === 'CANCELLED') {
        return (order.status || '').toUpperCase() === 'CANCELLED';
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  const openInvoiceForOrder = (order: RawOrder) => {
    const total = Number(order.totalAmount || 0);
    const subtotal = total / 1.05;
    const tax = total - subtotal;

    const data: TaxInvoiceData = {
      id: order.invoice?.id || order.id,
      invoiceNumber: order.invoice?.invoiceNumber || `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      orderId: order.id,
      issuedAt: order.invoice?.issuedAt || order.createdAt,
      status: order.status,
      paymentMethod: 'Cash on Delivery / Card on Arrival',
      customer: {
        name: order.customer?.name || 'Customer',
        email: order.customer?.email || 'customer@sheeshatonight.com',
        address: order.shippingAddress || 'Dubai Marina, Dubai, UAE',
        city: 'Dubai',
      },
      vendor: {
        name: order.vendor || 'SheeshaTonight Certified Vendor',
        location: 'Dubai, UAE',
      },
      items:
        order.items && order.items.length > 0
          ? order.items.map((item) => ({
              title: item.productName || 'Sheesha Package',
              quantity: item.quantity || 1,
              price: Number(item.price || 0),
              total: Number(item.price || 0) * Number(item.quantity || 1),
            }))
          : [
              {
                title: 'Sheesha Rental & Delivery Package',
                quantity: 1,
                price: subtotal,
                total: subtotal,
              },
            ],
      subtotal,
      tax,
      total,
    };

    setInvoiceData(data);
    setIsInvoiceOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (['DELIVERED', 'COMPLETED'].includes(s)) {
      return (
        <span className="order-badge-pill order-badge-delivered">
          <CheckCircle className="w-3.5 h-3.5" />
          {formatStatus(status)}
        </span>
      );
    }
    if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(s)) {
      return (
        <span className="order-badge-pill order-badge-intransit">
          <Truck className="w-3.5 h-3.5" />
          {formatStatus(status)}
        </span>
      );
    }
    if (['PREPARING', 'READY_FOR_PICKUP'].includes(s)) {
      return (
        <span className="order-badge-pill order-badge-preparing">
          <Clock className="w-3.5 h-3.5" />
          {formatStatus(status)}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return <span className="order-badge-pill order-badge-cancelled">Cancelled</span>;
    }
    return (
      <span className="order-badge-pill order-badge-preparing">
        {formatStatus(status)}
      </span>
    );
  };

  return (
    <div className="orders-page-container">
      {/* Page Header */}
      <div className="orders-page-header">
        <div>
          <h1>
            <Package className="w-5 h-5 text-[#74189B] shrink-0" />
            <span>My Orders</span>
          </h1>
          <p>Track, manage and download certified tax invoices for your sheesha orders</p>
        </div>

        <button onClick={fetchOrders} className="refresh-orders-btn">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="orders-toolbar">
        {/* Status Filter Tabs */}
        <div className="orders-tabs">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'In Progress' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`orders-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="orders-search-box">
          <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order # or vendor..."
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="orders-empty-luxury">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--purple)' }} />
          <h3>Loading orders...</h3>
          <p>Please wait while we retrieve your order history.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-luxury">
          <div className="orders-empty-icon">
            <Package size={26} />
          </div>
          <h3>No Orders Found</h3>
          <p>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No orders match your filter criteria. Try resetting your search filter.'
              : "You haven't placed any sheesha orders yet. Explore our curated selection of premium hookahs, tobacco flavors, and accessories."}
          </p>
          <Link href="/shop" className="browse-sheesha-cta">
            Browse Sheesha Collection →
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="luxury-order-card">
              {/* Card Header */}
              <div className="order-card-header">
                <div className="order-card-number">#{order.orderNumber}</div>
                {renderStatusBadge(order.status)}
              </div>

              {/* Card Body */}
              <div className="order-card-body">
                <div className="order-info-section">
                  <div className="order-vendor-title">
                    <Store className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Fulfilled by:</span>
                    <strong className="font-bold text-slate-800">{order.vendor || 'Royal Sheesha Lounge'}</strong>
                  </div>

                  <div className="order-items-tags">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((it, idx) => (
                        <span key={idx} className="order-item-tag">
                          {it.quantity}x {it.productName}
                        </span>
                      ))
                    ) : (
                      <span className="order-item-tag">Premium Sheesha Package</span>
                    )}
                  </div>

                  <div className="order-date-text">
                    Placed on:{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-AE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div className="order-pricing-section">
                  <span className="order-pricing-label">Total Amount</span>
                  <div className="order-pricing-value">
                    {formatAmount(order.totalAmount, order.currency)}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="order-card-footer">
                <div className="order-action-btns">
                  <button
                    type="button"
                    onClick={() => setActiveOrder(order)}
                    className="btn-details"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openInvoiceForOrder(order)}
                    className="btn-tax-invoice"
                    title="Certified UAE Tax Invoice"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tax Invoice</span>
                  </button>

                  <Link href="/shop" className="btn-reorder">
                    <span>Reorder</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {activeOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(24, 22, 42, 0.65)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f0ecf3',
                backgroundColor: 'var(--purple)',
                color: '#ffffff',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold)' }}>
                  Order Summary
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>
                  #{activeOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  border: 0,
                  background: 'transparent',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#faf8fb',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Current Status</div>
                  <strong style={{ color: 'var(--text)', fontSize: '13px' }}>
                    {formatStatus(activeOrder.status)}
                  </strong>
                </div>
                {renderStatusBadge(activeOrder.status)}
              </div>

              <div
                style={{
                  background: '#faf8fb',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Fulfillment Partner</div>
                <strong style={{ color: 'var(--text)', fontSize: '13px' }}>{activeOrder.vendor}</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '11px' }}>
                  Prepared fresh and delivered via temperature-controlled delivery.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.5px',
                    color: 'var(--muted)',
                    marginBottom: '10px',
                  }}
                >
                  Order Items
                </div>

                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  {activeOrder.items && activeOrder.items.length > 0 ? (
                    activeOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom:
                            idx < (activeOrder.items?.length || 0) - 1
                              ? '1px solid #f2edf3'
                              : 'none',
                          background: '#ffffff',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                            {it.productName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            Quantity: {it.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '13px' }}>
                          {formatAmount(it.price * it.quantity)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '12px' }}>
                      Standard Sheesha Package
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span>{formatAmount(Number(activeOrder.totalAmount || 0) / 1.05)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>
                  <span>UAE VAT (5%)</span>
                  <span>
                    {formatAmount(
                      Number(activeOrder.totalAmount || 0) -
                        Number(activeOrder.totalAmount || 0) / 1.05
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '10px',
                    fontWeight: 800,
                    fontSize: '15px',
                    color: 'var(--text)',
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--purple)', fontSize: '18px' }}>
                    {formatAmount(activeOrder.totalAmount, activeOrder.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '16px 24px',
                background: '#faf8fb',
                borderTop: '1px solid #f0ecf3',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const target = activeOrder;
                  setActiveOrder(null);
                  openInvoiceForOrder(target);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  background: 'var(--purple)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 0,
                }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                style={{
                  padding: '9px 18px',
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#555',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certified UAE VAT Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        data={invoiceData}
      />
    </div>
  );
}
