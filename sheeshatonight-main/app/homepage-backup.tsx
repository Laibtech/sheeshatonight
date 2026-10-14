'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { CheckCircle, Truck, Flame, Users, Check, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const [packageType, setPackageType] = useState('');
  const [flavor, setFlavor] = useState('');
  const [location, setLocation] = useState('');
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) =>
      prev.includes(index) ? prev.filter((faqIndex) => faqIndex !== index) : [...prev, index]
    );
  };

  const packages = [
    {
      name: 'Silver Sheesha Setup',
      price: 999,
      image: '/silver.webp',
      features: [
        '4 Sheesha units',
        '1 professional Sheesha master',
        '4 premium flavours',
        'Unlimited charcoal and head changes',
        'Portable burner',
        'Free Delivery',
        '3 hours of service plus 1 extra free hour'
      ]
    },
    {
      name: 'Gold Sheesha Setup',
      price: 1299,
      image: '/gold.webp',
      popular: true,
      features: [
        '6x Shisha of your choice',
        '1x experienced Shisha master',
        'Choose any 6 tobacco flavors',
        'Unlimited Charcoal & Head changes',
        'Portable burner',
        'Free Delivery',
        '4x hours of smoking 1 FREE extra hour'
      ]
    },
    {
      name: 'Platinum Sheesha Setup',
      price: 1999,
      image: '/platinum.webp',
      features: [
        '9x Shisha of your choice',
        '1x experienced Shisha master',
        'Choose any 9 tobacco flavors',
        'Unlimited Charcoal & Head changes',
        'Portable burner',
        'Free Delivery',
        '4x hours of smoking + FREE extra hour'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What is included in your Sheesha rental UAE service?',
      answer: 'Our Sheesha rental UAE service includes full delivery, professional setup, premium flavour selection, charcoal management, and an experienced Sheesha master (depending on your package). We handle installation, heat control, and head changes so you don\'t have to manage anything during your event.'
    },
    {
      question: 'Do you offer home Sheesha delivery in Dubai?',
      answer: 'Yes, we provide home Sheesha delivery in Dubai and across all Emirates. Whether you live in an apartment, villa, or beach house, our team delivers and sets everything up at your location. Same day Sheesha delivery UAE is available depending on availability.'
    },
    {
      question: 'Can I book Sheesha for a villa party or yacht event?',
      answer: 'Absolutely. Our villa party Sheesha setup and yacht party Sheesha rental UAE services are very popular. We understand outdoor airflow conditions and adjust heat levels accordingly to maintain smooth smoke throughout your event.'
    },
    {
      question: 'What flavours are available with the rental?',
      answer: 'We offer a wide range of premium tobacco flavours UAE customers enjoy, including mint blends, fruity combinations, and popular mixed flavours. You can choose your preferred flavours when booking your package.'
    },
    {
      question: 'Do you provide Sheesha for corporate events?',
      answer: 'Yes, we offer corporate event Sheesha catering for private company gatherings, product launches, networking events, and celebrations. Our team ensures professional presentation and organised service suitable for corporate settings.'
    },
    {
      question: 'Are all vendors verified?',
      answer: 'Absolutely! Every vendor on SheeshaTonight is checked for quality, hygiene, and authenticity before being listed.'
    },
    {
      question: 'Can I list my Sheesha business?',
      answer: 'Yes! Visit our Join as a Vendor page to register your business and start receiving orders.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, digital wallets, and cash on delivery for your convenience.'
    },
    {
      question: 'Can I book Sheesha for events and private parties?',
      answer: 'Yes! SheeshaTonight provides full event setups for birthdays, gatherings, rooftops, cafes, and private parties. Trained staff and multiple setups can also be arranged depending on your booking.'
    },
    {
      question: 'How long can I keep the Sheesha rental?',
      answer: 'Standard rental time is 3 to 4 hours, but extended hour and full night options are also available depending on your vendor.'
    }
  ];

  const testimonials: Array<{ name: string; role: string; text: string; img: string }> = [
    { name: 'Ahmed Khan', role: 'Dubai, UAE', text: 'Amazing service! The Sheesha was premium, the flavors were super smooth, and the Shisha Master handled everything professionally. My friends loved it!', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Sara Al Qasimi', role: 'Event Host', text: 'Best Sheesha rental experience ever! They arrived on time, set everything up beautifully, and the ambiance was perfect for our event.', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Omar Hassan', role: 'Regular Customer', text: 'The flavors were top-notch! Loved the Blue Mist and Double Apple. The Sheesha Master stayed throughout and maintained everything perfectly.', img: 'https://randomuser.me/api/portraits/men/58.jpg' }
  ];

  const activeTestimonialData = testimonials[activeTestimonial] ?? testimonials[0]!;

  return (
    <PageLayout>
      {/* Hero Section with Background */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6"
        style={{
          backgroundImage: 'url(https://sheeshatonight.com/frontend/assets/images/feature/bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/50"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Sheesha Rental <span className="text-[#D4AF37]">UAE</span>
              </h1>
              <p className="text-xl">Luxury Sheesha Setup Delivered Across All Emirates</p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#FF7A00]" />
                  <span className="text-sm font-medium">Verified Vendors</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Truck className="w-5 h-5 text-[#FF7A00]" />
                  <span className="text-sm font-medium">24/7 Delivery</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Flame className="w-5 h-5 text-[#FF7A00]" />
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Users className="w-5 h-5 text-[#FF7A00]" />
                  <span className="text-sm font-medium">For ages 21+</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-[#D4AF37]">10+</p>
                  <p className="text-sm">Vendors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#D4AF37]">100+</p>
                  <p className="text-sm">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#D4AF37]">24/7</p>
                  <p className="text-sm">Support</p>
                </div>
              </div>
            </div>

            {/* Right Filter Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Find Your Perfect Sheesha</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Package Type</label>
                  <select 
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium"
                  >
                    <option value="">Select Package</option>
                    <option value="premium">Premium Setup Rental</option>
                    <option value="basic">Basic Setup Rental</option>
                    <option value="luxury">Luxury Setup Rental</option>
                    <option value="private">Private Event Package</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Flavor</label>
                  <select 
                    value={flavor}
                    onChange={(e) => setFlavor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium"
                  >
                    <option value="">Choose Flavor</option>
                    <option value="Double Apple">Double Apple</option>
                    <option value="Mint">Mint</option>
                    <option value="Grapemint">Grapemint</option>
                    <option value="Blue Mist">Blue Mist</option>
                    <option value="Mixed Fruit">Mixed Fruit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Location</label>
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium"
                  >
                    <option value="">Select Emirate</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-[#E56A00] transition"
                >
                  Search Sheesha
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Offer Section */}
      <section className="bg-[#f8f3e9] py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h4 className="text-xl font-semibold">Luxury <span className="text-[#55083e]">Sheesha Rental Dubai</span></h4>
              <h2 className="text-4xl font-bold">Villas, Yachts & <span className="text-[#55083e]">Private Parties</span></h2>
              <div className="bg-[#55083e]/10 p-4 rounded-lg">
                <p className="text-[#55083e] font-bold text-lg">Premium • Stylish • Fully Managed</p>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Dubai&apos;s lifestyle includes villa parties, rooftop gatherings, yacht celebrations, weddings, and corporate events.
                Our Luxury Sheesha Rental UAE service is fully equipped to manage all types of private and high end events with professional setup and on site service.
              </p>
              <ul className="space-y-3">
                {['Villa party Sheesha setup', 'Yacht party Sheesha rental UAE', 'Private birthday & wedding celebrations', 'Corporate event Sheesha catering', 'Outdoor event Sheesha setup'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#55083e]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/rentals" className="inline-block px-8 py-4 bg-gradient-to-r from-[#FFB100] via-[#FF7A00] to-[#E94280] text-white rounded-xl font-bold hover:shadow-xl transition">
                Book Luxury Setup Now
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-64 max-w-lg rounded-full bg-white/50 blur-3xl opacity-70" />
              <div className="pointer-events-none absolute inset-x-6 top-16 mx-auto h-48 max-w-md rounded-full bg-pink-200/30 blur-3xl opacity-80" />
              <img src="https://sheeshatonight.com/frontend/assets/images/product/hos-hookah.png" alt="Luxury Sheesha" className="relative z-10 w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Rental Packages Section */}
      <section className="bg-[#f8f3e9] py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Premium Gatherings</h2>
            <p className="text-slate-600">Choose the perfect Sheesha setup for your event</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur rounded-2xl p-6 hover:scale-105 transition shadow-lg overflow-hidden">
                <div className="overflow-hidden rounded-t-2xl mb-4 h-56 bg-white">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-xl font-bold mb-2">{pkg.name} – AED {pkg.price}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {index === 0 && 'Perfect for smaller home gatherings and private celebrations.'}
                  {index === 1 && 'Our most popular package for villa party Sheesha setup and birthday events.'}
                  {index === 2 && 'Designed for large events and premium occasions.'}
                </p>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-2xl font-bold text-[#D4AF37] mb-4">AED {pkg.price}</p>
                <Link href={`/rentals`} className="block w-full py-3 bg-gradient-to-r from-[#FFB100] via-[#FF7A00] to-[#E94280] text-white rounded-xl font-bold text-center hover:shadow-xl transition">
                  Order Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section 
        className="relative py-32 px-6 text-center text-white"
        style={{
          backgroundImage: 'url(https://sheeshatonight.com/frontend/assets/images/brand/image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-purple-900/60"></div>
        <div className="container mx-auto relative z-10">
          <h5 className="text-lg uppercase tracking-wider mb-4">RENTAL</h5>
          <h2 className="text-5xl font-bold mb-6">Rent a Premium Sheesha</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Experience luxurious sheesha at your home, lounge, or event with complete setup and premium flavors ready to enjoy.
          </p>
          <Link href="/rentals" className="inline-block px-10 py-4 bg-gradient-to-r from-[#FFB100] via-[#FF7A00] to-[#E94280] text-white rounded-xl font-bold hover:shadow-2xl transition">
            Book Now
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#f8f3e9] py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#5c0e4e] via-[#353a74] to-[#1d063a] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600">Everything you need to know about SheeshaTonight from bookings to home deliveries.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#1d0f36]">
              <img src="/blog.webp" alt="Sheesha service FAQ" className="w-full h-[520px] object-cover" />
              <div className="absolute left-6 right-6 bottom-6 rounded-[2rem] bg-white/95 p-8 shadow-2xl backdrop-blur-md">
                <span className="inline-flex items-center rounded-full bg-[#D4AF37]/10 px-3 py-1 text-sm font-semibold text-[#5c0e4e]">
                  Popular FAQs
                </span>
                <h3 className="mt-4 text-3xl font-bold text-slate-900">
                  Quick answers for your next booking
                </h3>
                <p className="mt-3 text-slate-600">
                  Find clarity on packages, delivery, setup, and event support so you can plan with confidence.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#5c0e4e] transition-transform flex-shrink-0 ${openFaqs.includes(index) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaqs.includes(index) && (
                    <div className="px-5 pb-5 text-slate-600 border-t">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h5 className="text-lg text-slate-600 mb-2">What Our Clients Say</h5>
            <h2 className="text-4xl font-bold">Premium Sheesha Experience, Every Time</h2>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <img 
                src={activeTestimonialData.img} 
                alt={activeTestimonialData.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-blue-500"
              />
              <p className="text-xl text-slate-700 mb-6 italic">&quot;{activeTestimonialData.text}&quot;</p>
              <h3 className="font-bold text-lg">{activeTestimonialData.name}</h3>
              <p className="text-blue-500 uppercase text-sm">{activeTestimonialData.role}</p>
            </div>
            
            <div className="flex justify-center gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-4 transition ${
                    activeTestimonial === index ? 'border-blue-500 scale-110' : 'border-gray-300 opacity-50'
                  }`}
                >
                  <img src={testimonial.img} alt={testimonial.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-[#f8f3e9] py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Blog</h2>
            <p className="text-slate-600">Looking for the perfect place to unwind after a long day?</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition">
              <div className="h-48 overflow-hidden">
                <img
                  src="/blog.webp"
                  alt="Popular Sheesha Flavors"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-2">04 Mar, 2026</p>
                <h4 className="text-xl font-bold mb-3">Top 5 Most Popular Sheesha Flavors in the UAE Right Now</h4>
                <Link href="/checkout" className="inline-block px-6 py-3 bg-gradient-to-r from-[#FFB100] via-[#FF7A00] to-[#E94280] text-white rounded-xl font-bold hover:shadow-xl transition">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Gallery</h2>
            <p className="text-slate-600">Experience the luxury and elegance of our sheesha setups from cozy lounges to premium celebrations.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p1.webp"
                alt="Signature Sheesha Experience"
                className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-300 mb-2">Luxury Service</p>
                <h3 className="text-3xl font-semibold">Premium sheesha moments delivered with style</h3>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p9.webp"
                alt="Sheesha Setup"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p3.webp"
                alt="Sheesha Event"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p6.webp"
                alt="Sheesha Lounge"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p5.webp"
                alt="Premium Sheesha"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p4.webp"
                alt="Sheesha Party"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p7.webp"
                alt="Elegant Sheesha"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-[1.75rem] shadow-2xl group">
              <img
                src="https://sheeshatonight.com/frontend/assets/images/brand/p2.webp"
                alt="Sheesha Lounge Vibes"
                className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
