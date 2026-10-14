import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
// Conditionally import prisma only if DATABASE_URL is set
let prisma:any=null;
if (process.env.DATABASE_URL){
  const mod=require('@/lib/prisma');
  prisma=mod.prisma;
}

export const revalidate = 60; // 60-second edge cache for instant delivery

export default async function TermsPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: 'terms' },
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-[#74189B]">Home</Link>
            <span>/</span>
            <span className="text-[#74189B]">Terms & Conditions</span>
          </div>

          <header className="border-b border-slate-100 pb-8 mb-8">
            <div className="flex items-center gap-2 text-[#F1A51D] text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles size={14} /> Official Terms of Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {page?.title || 'Terms & Conditions'}
            </h1>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <Calendar size={14} /> Last updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'June 2026'}
            </p>
          </header>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 whitespace-pre-wrap leading-relaxed text-[15px]">
            {page?.content || 'Terms and conditions are currently being updated.'}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
