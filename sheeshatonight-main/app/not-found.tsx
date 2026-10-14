import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl text-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#F1A51D] font-bold">Page Not Found</p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#571275]">404 — Nothing To See Here</h1>
        <p className="mt-3 text-slate-600 text-sm max-w-md mx-auto">We couldn’t find the page you were looking for. Return to our homepage or explore our luxury sheesha collection.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#571275] px-6 py-3 text-white text-sm font-semibold hover:bg-[#74189B] transition shadow-md">Go Back Home</Link>
          <Link href="/shop" className="inline-flex items-center justify-center rounded-xl bg-[#F1A51D] px-6 py-3 text-white text-sm font-semibold hover:bg-[#d99010] transition shadow-md">Explore Shop</Link>
        </div>
      </div>
    </div>
  );
}
