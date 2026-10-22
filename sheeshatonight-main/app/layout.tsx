import type { Metadata } from 'next';
import './globals.css';
// Conditionally import prisma only if DATABASE_URL is set
let prisma:any=null;
if (process.env.DATABASE_URL){
  const mod=require('@/lib/prisma');
  prisma=mod.prisma;
}
import { DEFAULT_SEO_CONFIG } from '@/app/api/admin/seo/route';
import { AuthHydration } from '@/components/AuthHydration';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import VerticalMarquee from '@/components/VerticalMarquee';
import AgeVerification from '@/components/AgeVerification';
import MobileBottomNav from '@/components/MobileBottomNav';
import PWARegistration from '@/components/PWARegistration';

export async function generateMetadata(): Promise<Metadata> {
  let seo = DEFAULT_SEO_CONFIG;
  try {
    if (prisma) {
      const record = await prisma.cmsContent.findUnique({
        where: { key: 'seo_settings' },
      });
      if (record?.value) {
        seo = record.value as any;
      }
    }
  } catch (e) {}

  const g = seo.global || DEFAULT_SEO_CONFIG.global;
  const s = seo.social || DEFAULT_SEO_CONFIG.social;

  return {
    title: {
      default: g.defaultTitle,
      template: g.titleTemplate || '%s | SheeshaTonight',
    },
    description: g.defaultDescription,
    keywords: g.keywords ? g.keywords.split(',').map((k: string) => k.trim()) : undefined,
    authors: [{ name: g.author || 'SheeshaTonight' }],
    metadataBase: new URL(g.canonicalBase || 'https://sheeshatonight.com'),
    alternates: {
      canonical: '/',
    },
    robots: g.robots || 'index, follow',
    openGraph: {
      title: g.defaultTitle,
      description: g.defaultDescription,
      siteName: s.ogSiteName || 'SheeshaTonight',
      images: [
        {
          url: s.defaultOgImage || '/hero-banner.png',
          width: 1200,
          height: 630,
          alt: 'SheeshaTonight Luxury Hookah Experience',
        },
      ],
      locale: 'en_AE',
      type: 'website',
    },
    twitter: {
      card: (s.twitterCard as any) || 'summary_large_image',
      title: g.defaultTitle,
      description: g.defaultDescription,
    },
  };
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let schemaData: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SheeshaTonight UAE',
    image: 'https://sheeshatonight.com/hero-banner.png',
    telephone: '+971 4 555 1234',
    email: 'concierge@sheeshatonight.com',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Downtown Boulevard, Burj Plaza',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.1972,
      longitude: 55.2744,
    },
  };

  let faqSchemaData: any = null;
  let verificationData: any = null;
  let analyticsData: any = null;

  try {
    const record = await prisma.cmsContent.findUnique({
      where: { key: 'seo_settings' },
    });
    const val: any = record?.value;
    if (val) {
      if (val.schema) {
        const s = val.schema;
        schemaData = {
          '@context': 'https://schema.org',
          '@type': s.businessType || 'LocalBusiness',
          name: s.name || 'SheeshaTonight UAE',
          telephone: s.telephone || '+971 4 555 1234',
          email: s.email || 'concierge@sheeshatonight.com',
          priceRange: s.priceRange || '$$$',
          currenciesAccepted: s.currenciesAccepted || 'AED, USD',
          address: {
            '@type': 'PostalAddress',
            streetAddress: s.streetAddress || 'Downtown Boulevard, Burj Plaza',
            addressLocality: s.addressLocality || 'Dubai',
            addressCountry: s.addressCountry || 'AE',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: s.latitude || 25.1972,
            longitude: s.longitude || 55.2744,
          },
        };
      }

      if (val.schema?.enableFaqSchema && Array.isArray(val.schema?.faqs) && val.schema.faqs.length > 0) {
        faqSchemaData = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: val.schema.faqs.map((f: any) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        };
      }
      if (val.verification) {
        verificationData = val.verification;
      }
      if (val.analytics) {
        analyticsData = val.analytics;
      }
    }
  } catch (e) {}

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA & Mobile Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#74189B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SheeshaTonight" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Verification Meta Tags */}
        {verificationData?.google && (
          <meta name="google-site-verification" content={verificationData.google} />
        )}
        {verificationData?.bing && (
          <meta name="msvalidate.01" content={verificationData.bing} />
        )}

        {/* JSON-LD WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SheeshaTonight',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://sheeshatonight.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sheeshatonight.com'}/shop?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* JSON-LD LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />

        {/* JSON-LD FAQPage Schema */}
        {faqSchemaData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
          />
        )}

        {/* Google Analytics 4 */}
        {analyticsData?.ga4Id && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsData.ga4Id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${analyticsData.ga4Id}');`,
              }}
            />
          </>
        )}

        {/* Meta Pixel */}
        {analyticsData?.metaPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${analyticsData.metaPixelId}');fbq('track', 'PageView');`,
            }}
          />
        )}
      </head>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthHydration />
              <LayoutWrapper>{children}</LayoutWrapper>
              <WhatsAppFloat />
              <VerticalMarquee />
              <AgeVerification />
              <MobileBottomNav />
              <PWARegistration />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
