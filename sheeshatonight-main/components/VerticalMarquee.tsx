'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerticalMarquee() {
  const pathname = usePathname() || '';

  // Hide marquee strip on internal dashboard routes (/dashboard, /admin, /vendor portal)
  const isDashboard =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/vendor' ||
    pathname.startsWith('/vendor/');

  if (isDashboard) {
    return null;
  }

  return (
    <div className="vertical-marquee" title="SheeshaTonight Luxury Highlights">
      <div className="vertical-marquee-track">
        <span>PREMIUM SHEESHA</span>
        <span>LUXURY RENTALS</span>
        <span>VIP EXPERIENCE</span>
        <span>DUBAI TONIGHT</span>
        <span>EXPRESS DELIVERY</span>
        <span>ARTISAN FLAVORS</span>
        <span>EXCLUSIVE LOUNGES</span>
        <span>VERIFIED MASTERS</span>

        <span>PREMIUM SHEESHA</span>
        <span>LUXURY RENTALS</span>
        <span>VIP EXPERIENCE</span>
        <span>DUBAI TONIGHT</span>
        <span>EXPRESS DELIVERY</span>
        <span>ARTISAN FLAVORS</span>
        <span>EXCLUSIVE LOUNGES</span>
        <span>VERIFIED MASTERS</span>

        <span>PREMIUM SHEESHA</span>
        <span>LUXURY RENTALS</span>
        <span>VIP EXPERIENCE</span>
        <span>DUBAI TONIGHT</span>
        <span>EXPRESS DELIVERY</span>
        <span>ARTISAN FLAVORS</span>
        <span>EXCLUSIVE LOUNGES</span>
        <span>VERIFIED MASTERS</span>

        <span>PREMIUM SHEESHA</span>
        <span>LUXURY RENTALS</span>
        <span>VIP EXPERIENCE</span>
        <span>DUBAI TONIGHT</span>
        <span>EXPRESS DELIVERY</span>
        <span>ARTISAN FLAVORS</span>
        <span>EXCLUSIVE LOUNGES</span>
        <span>VERIFIED MASTERS</span>
      </div>
    </div>
  );
}

