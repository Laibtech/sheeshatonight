'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, Plus, Minus, ShoppingCart, Gem, Wind, Flame } from 'lucide-react';

export default function MakeYourSheesha() {
  const [quantity, setQuantity] = useState(1);
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedHose, setSelectedHose] = useState('');
  const [selectedBowl, setSelectedBowl] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const bases = [
    { id: 'classic', name: 'Classic Glass', price: 150 },
    { id: 'modern', name: 'Modern Crystal', price: 250 },
    { id: 'premium', name: 'Premium Gold', price: 350 }
  ];

  const hoses = [
    { id: 'standard', name: 'Standard Hose', price: 50 },
    { id: 'silicone', name: 'Silicone Hose', price: 80 },
    { id: 'premium', name: 'Premium Leather', price: 120 }
  ];

  const bowls = [
    { id: 'clay', name: 'Traditional Clay', price: 40 },
    { id: 'silicone', name: 'Silicone Bowl', price: 60 },
    { id: 'phunnel', name: 'Phunnel Bowl', price: 80 }
  ];

  const flavors = [
    'Double Apple', 'Mint', 'Lemon Mint', 'Watermelon', 
    'Blueberry', 'Grape', 'Peach', 'Mango', 
    'Orange', 'Cherry', 'Vanilla', 'Coffee'
  ];

  const toggleFlavor = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else if (selectedFlavors.length < 5) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedBase) {
      const base = bases.find(b => b.id === selectedBase);
      if (base) total += base.price;
    }
    if (selectedHose) {
      const hose = hoses.find(h => h.id === selectedHose);
      if (hose) total += hose.price;
    }
    if (selectedBowl) {
      const bowl = bowls.find(b => b.id === selectedBowl);
      if (bowl) total += bowl.price;
    }
    total += selectedFlavors.length * 30; // AED 30 per flavor
    return total * quantity;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="site-page-hero site-page-hero-compact">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Build Your <span className="text-[#D4AF37]">Custom Sheesha</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Create your personalized sheesha setup with your choice of base, hose, bowl, and flavors
          </p>
        </div>
      </section>

      {/* Builder Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Choose Base */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  <span className="inline-block w-10 h-10 bg-[#D4AF37] text-white rounded-full text-center leading-10 mr-3">1</span>
                  Choose Your Base
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {bases.map((base) => (
                    <button
                      key={base.id}
                      onClick={() => setSelectedBase(base.id)}
                      className={`p-6 rounded-lg border-2 transition ${
                        selectedBase === base.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-slate-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex justify-center mb-3">
                        <Gem className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{base.name}</h3>
                      <p className="text-[#D4AF37] font-semibold">AED {base.price}</p>
                      {selectedBase === base.id && (
                        <div className="mt-3">
                          <Check className="w-6 h-6 text-[#D4AF37] mx-auto" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Hose */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  <span className="inline-block w-10 h-10 bg-[#D4AF37] text-white rounded-full text-center leading-10 mr-3">2</span>
                  Choose Your Hose
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {hoses.map((hose) => (
                    <button
                      key={hose.id}
                      onClick={() => setSelectedHose(hose.id)}
                      className={`p-6 rounded-lg border-2 transition ${
                        selectedHose === hose.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-slate-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex justify-center mb-3">
                        <Wind className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{hose.name}</h3>
                      <p className="text-[#D4AF37] font-semibold">AED {hose.price}</p>
                      {selectedHose === hose.id && (
                        <div className="mt-3">
                          <Check className="w-6 h-6 text-[#D4AF37] mx-auto" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Choose Bowl */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  <span className="inline-block w-10 h-10 bg-[#D4AF37] text-white rounded-full text-center leading-10 mr-3">3</span>
                  Choose Your Bowl
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {bowls.map((bowl) => (
                    <button
                      key={bowl.id}
                      onClick={() => setSelectedBowl(bowl.id)}
                      className={`p-6 rounded-lg border-2 transition ${
                        selectedBowl === bowl.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-slate-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex justify-center mb-3">
                        <Flame className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{bowl.name}</h3>
                      <p className="text-[#D4AF37] font-semibold">AED {bowl.price}</p>
                      {selectedBowl === bowl.id && (
                        <div className="mt-3">
                          <Check className="w-6 h-6 text-[#D4AF37] mx-auto" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Choose Flavors */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  <span className="inline-block w-10 h-10 bg-[#D4AF37] text-white rounded-full text-center leading-10 mr-3">4</span>
                  Choose Flavors
                </h2>
                <p className="text-slate-600 mb-6 ml-13">Select up to 5 flavors (AED 30 each)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => toggleFlavor(flavor)}
                      disabled={!selectedFlavors.includes(flavor) && selectedFlavors.length >= 5}
                      className={`p-4 rounded-lg border-2 text-sm font-medium transition ${
                        selectedFlavors.includes(flavor)
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-slate-900'
                          : 'border-slate-200 hover:border-[#D4AF37]/50 text-slate-700'
                      } ${!selectedFlavors.includes(flavor) && selectedFlavors.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {flavor}
                      {selectedFlavors.includes(flavor) && (
                        <Check className="w-4 h-4 text-[#D4AF37] mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  {selectedFlavors.length} of 5 flavors selected
                </p>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-8 shadow-lg sticky top-24">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {selectedBase && (
                    <div className="flex justify-between text-slate-700">
                      <span>{bases.find(b => b.id === selectedBase)?.name}</span>
                      <span>AED {bases.find(b => b.id === selectedBase)?.price}</span>
                    </div>
                  )}
                  {selectedHose && (
                    <div className="flex justify-between text-slate-700">
                      <span>{hoses.find(h => h.id === selectedHose)?.name}</span>
                      <span>AED {hoses.find(h => h.id === selectedHose)?.price}</span>
                    </div>
                  )}
                  {selectedBowl && (
                    <div className="flex justify-between text-slate-700">
                      <span>{bowls.find(b => b.id === selectedBowl)?.name}</span>
                      <span>AED {bowls.find(b => b.id === selectedBowl)?.price}</span>
                    </div>
                  )}
                  {selectedFlavors.length > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>{selectedFlavors.length} Flavors</span>
                      <span>AED {selectedFlavors.length * 30}</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-slate-700 font-medium mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                      <Minus className="w-5 h-5 mx-auto" />
                    </button>
                    <span className="text-2xl font-bold text-slate-900 w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                      <Plus className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-[#D4AF37]">AED {calculateTotal()}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Link
                  href="/checkout"
                  className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    selectedBase && selectedHose && selectedBowl && selectedFlavors.length > 0
                      ? 'bg-[#D4AF37] text-white hover:bg-[#B8902A]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Link>

                {(!selectedBase || !selectedHose || !selectedBowl || selectedFlavors.length === 0) && (
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Please complete all selections
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
