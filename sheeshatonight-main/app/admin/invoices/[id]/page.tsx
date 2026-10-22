'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, Loader2, FileText, Download } from 'lucide-react';
import { downloadInvoiceAsPDF, generateInvoicePDF } from '@/lib/invoicePdf';

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  orderId: string;
  issuedAt: string;
  subtotal: number;
  tax: number;
  total: number;
  order: {
    status: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
      phone?: string;
      addresses?: Array<{
        street: string;
        building?: string;
        city: string;
        country: string;
      }>;
    };
    vendor: {
      name: string;
      location?: string;
      phone?: string;
    };
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        title: string;
        sku?: string;
      };
    }>;
  };
}

export default function AdminInvoiceDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const routeParams = useParams();
  const unwrapped = params ? ('then' in params ? React.use(params) : params) : null;
  const invoiceId = (routeParams?.id as string) || unwrapped?.id || '';

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const json = await res.json();
          setInvoice(json.data || json.invoice || null);
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const formatAED = (amount: number = 0) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      setDownloading(true);
      await downloadInvoiceAsPDF('printable-tax-invoice', `Tax-Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Invoice Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested invoice identifier could not be retrieved from the database.
        </p>
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#74189B] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Link>
      </div>
    );
  }

  const customerAddress = invoice.order?.user?.addresses?.[0];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Action Header (Hidden on Print) */}
      <div className="print:hidden flex items-center justify-between gap-4">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E9E3EB] text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Invoices Catalogue</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${invoice.orderId}`}
            className="px-4 py-2 bg-white border border-[#E9E3EB] hover:bg-slate-50 text-xs font-bold text-[#74189B] rounded-xl transition"
          >
            View Order #{invoice.orderNumber}
          </Link>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F1A51D] to-[#D4AF37] hover:brightness-110 text-slate-950 text-xs font-black rounded-xl shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Download Official PDF Invoice"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#74189B] hover:bg-[#571275] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Paper */}
      <div id="printable-tax-invoice" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-14 text-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-100">
          <div>
            <Image
              src="/logo.png"
              alt="SheeshaTonight"
              width={200}
              height={65}
              priority
              className="object-contain mb-3"
            />
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              SheeshaTonight Portal LLC
            </p>
            <p className="text-xs text-slate-500">Sheikh Zayed Road, Downtown Dubai</p>
            <p className="text-xs text-slate-500">Dubai, United Arab Emirates</p>
            <p className="text-xs font-semibold text-[#74189B] mt-1">
              TRN (VAT Registration): 100482938400003
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-md bg-[#74189B]/10 text-[#74189B] text-xs font-black uppercase tracking-widest mb-2">
              TAX INVOICE / فاتورة ضريبية
            </span>
            <h2 className="text-2xl font-mono font-black text-slate-900">
              #{invoice.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Order Ref: <span className="font-bold text-slate-800">#{invoice.orderNumber}</span>
            </p>
            <p className="text-xs text-slate-500">
              Date:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(invoice.issuedAt).toLocaleDateString('en-AE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PAID & VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Customer & Vendor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
              Billed To (Customer)
            </p>
            <h3 className="text-sm font-bold text-slate-900">
              {invoice.order?.user?.name || 'Customer'}
            </h3>
            <p className="text-slate-600 mt-0.5">{invoice.order?.user?.email}</p>
            {invoice.order?.user?.phone && (
              <p className="text-slate-600">{invoice.order.user.phone}</p>
            )}
            {customerAddress && (
              <p className="text-slate-600 mt-1">
                {customerAddress.street}
                {customerAddress.building ? `, ${customerAddress.building}` : ''}
                {customerAddress.city ? `, ${customerAddress.city}` : ''}, UAE
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
              Fulfilled By (Vendor / Supplier)
            </p>
            <h3 className="text-sm font-bold text-slate-900">
              {invoice.order?.vendor?.name || 'SheeshaTonight Direct'}
            </h3>
            <p className="text-slate-600 mt-0.5">
              {invoice.order?.vendor?.location || 'Dubai, United Arab Emirates'}
            </p>
            {invoice.order?.vendor?.phone && (
              <p className="text-slate-500 mt-0.5">Tel: {invoice.order.vendor.phone}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 text-slate-700">Item Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">VAT (5%)</th>
                <th className="pb-3 text-right">Total (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.order?.items && invoice.order.items.length > 0 ? (
                invoice.order.items.map((item, idx) => {
                  const lineSubtotal = Number(item.price) * item.quantity;
                  const lineVat = lineSubtotal * 0.05;
                  return (
                    <tr key={idx} className="py-3">
                      <td className="py-3.5">
                        <p className="font-bold text-slate-900">{item.product?.title || 'Sheesha Product'}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="py-3.5 text-center text-slate-600 font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 text-right text-slate-600 font-mono">
                        {formatAED(Number(item.price))}
                      </td>
                      <td className="py-3.5 text-right text-slate-500 font-mono">
                        {formatAED(lineVat)}
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-900 font-mono">
                        {formatAED(lineSubtotal + lineVat)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-3 font-semibold text-slate-900">
                    Premium Sheesha Rental Experience
                  </td>
                  <td className="py-3 text-center text-slate-600 font-bold">1</td>
                  <td className="py-3 text-right text-slate-600 font-mono">
                    {formatAED(invoice.subtotal)}
                  </td>
                  <td className="py-3 text-right text-slate-500 font-mono">
                    {formatAED(invoice.tax)}
                  </td>
                  <td className="py-3 text-right font-black text-slate-900 font-mono">
                    {formatAED(invoice.total)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t-2 border-slate-100">
          <div className="w-full sm:w-80 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Excl. VAT)</span>
              <span className="font-mono font-semibold">{formatAED(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>UAE Federal Tax Authority VAT (5%)</span>
              <span className="font-mono font-semibold">{formatAED(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t-2 border-slate-200">
              <span>Total Amount (AED)</span>
              <span className="text-lg text-[#74189B] font-mono">
                {formatAED(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notice & Stamp */}
        <div className="mt-14 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="max-w-md text-left">
            <p className="font-semibold text-slate-600">
              Official Tax Invoice
            </p>
            <p className="mt-0.5">
              This tax invoice is issued electronically and verified in accordance with the regulations of the UAE Federal Tax Authority (FTA).
            </p>
          </div>

          <div className="text-center sm:text-right border border-dashed border-slate-300 rounded-2xl px-5 py-3 bg-slate-50">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Authorized Stamp</p>
            <p className="italic font-black text-slate-900 text-sm mt-0.5">
              SheeshaTonight Portal LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
