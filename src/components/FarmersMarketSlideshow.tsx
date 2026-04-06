import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FarmersMarketSlideshow = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      eyebrow: 'Fresh produce, better trust',
      title: 'A cleaner marketplace for farm buying and selling',
      subtitle: 'Browse verified products, transparent pricing, and a more reliable ordering experience built for buyers and farmers in Malawi.',
      primary: 'Browse Products',
      secondary: 'Become a Seller',
      tone: 'from-[#1d6f5c] via-[#2a8a72] to-[#d7a86e]',
      stats: [
        { label: 'Verified sellers', value: 'Admin-approved onboarding', icon: ShieldCheck },
        { label: 'Shipping pricing', value: 'Clear city-based rates', icon: Truck },
        { label: 'Checkout flow', value: 'Professional hosted payments', icon: Sparkles },
      ],
    },
    {
      eyebrow: 'Seasonal marketplace',
      title: 'Discover produce worth buying at first glance',
      subtitle: 'From leafy greens to grains and fresh fruits, the catalog is designed to feel easier to scan, compare, and trust.',
      primary: 'Shop Fresh Produce',
      secondary: 'View Categories',
      tone: 'from-[#15382f] via-[#1b5648] to-[#6ea86f]',
      stats: [
        { label: 'Better discovery', value: 'Smarter filtering and browse views', icon: Sparkles },
        { label: 'Inventory visibility', value: 'Real stock tied to seller listings', icon: ShieldCheck },
        { label: 'Local movement', value: 'Faster sourcing across key cities', icon: Truck },
      ],
    },
    {
      eyebrow: 'Built for confidence',
      title: 'Professional buying tools with a human marketplace feel',
      subtitle: 'A steadier visual system, more consistent workflows, and admin controls that help maintain quality across the platform.',
      primary: 'Open Marketplace',
      secondary: 'Learn More',
      tone: 'from-[#223349] via-[#34526d] to-[#d9b179]',
      stats: [
        { label: 'Admin controls', value: 'Review sellers and moderate listings', icon: ShieldCheck },
        { label: 'Order flow', value: 'Payments and statuses stay aligned', icon: Sparkles },
        { label: 'Marketplace UX', value: 'Cleaner, calmer, more premium', icon: Truck },
      ],
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-6">
      <div className={`max-w-7xl mx-auto rounded-[2rem] text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] bg-gradient-to-br ${slide.tone}`}>
        <div className="relative overflow-hidden rounded-[2rem] px-6 sm:px-10 lg:px-14 py-14 lg:py-18">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_28%)]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-white/75 mb-5">{slide.eyebrow}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] mb-5">{slide.title}</h1>
              <p className="text-lg md:text-xl text-white/82 leading-8 mb-8 max-w-xl">{slide.subtitle}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push('/products')} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                  {slide.primary}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => router.push('/seller/apply')} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/16 transition-colors">
                  {slide.secondary}
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {slide.stats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-11 w-11 rounded-2xl bg-white/14 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm uppercase tracking-[0.2em] text-white/70">{item.label}</p>
                    </div>
                    <p className="text-xl font-semibold tracking-tight">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'w-9 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="h-11 w-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="h-11 w-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setIsAutoPlaying((value) => !value)} className="h-11 w-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmersMarketSlideshow;
