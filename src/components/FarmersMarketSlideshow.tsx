import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FarmersMarketSlideshow = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      eyebrow: 'Fresh produce, better trust',
      title: 'A cleaner marketplace for farm buying and selling',
      subtitle: 'Browse verified products, transparent pricing, and a more reliable ordering experience for buyers and farmers in Malawi.',
      primary: 'Browse Products',
      secondary: 'Become a Seller',
      tone: 'from-[#1d6f5c] via-[#2a8a72] to-[#d7a86e]',
      meta: 'Verified sellers. Transparent pricing. Clear shipping rates.',
    },
    {
      eyebrow: 'Seasonal marketplace',
      title: 'Discover produce worth buying at first glance',
      subtitle: 'From leafy greens to grains and fresh fruits, the catalog is easier to scan, compare, and trust.',
      primary: 'Shop Fresh Produce',
      secondary: 'View Categories',
      tone: 'from-[#15382f] via-[#1b5648] to-[#6ea86f]',
      meta: 'Smarter filtering. Real stock visibility. Faster browsing.',
    },
    {
      eyebrow: 'Marketplace quality',
      title: 'Trusted buying and selling without the clutter',
      subtitle: 'Consistent workflows and better platform controls help keep the marketplace dependable.',
      primary: 'Open Marketplace',
      secondary: 'Become a Seller',
      tone: 'from-[#223349] via-[#34526d] to-[#d9b179]',
      meta: 'Moderated listings. Cleaner order flow. A calmer marketplace.',
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <div className={`max-w-7xl mx-auto rounded-[2rem] text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] bg-gradient-to-br ${slide.tone}`}>
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-8 lg:px-12 lg:py-11">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_28%)]" />
          <div className="relative max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/75 sm:text-sm">{slide.eyebrow}</p>
              <h1 className="mb-4 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-[3.2rem]">{slide.title}</h1>
              <p className="mb-5 max-w-2xl text-base leading-7 text-white/82 lg:text-lg">{slide.subtitle}</p>
              <p className="mb-6 text-sm font-medium text-white/72">{slide.meta}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push('/products')} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                  {slide.primary}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => router.push('/seller/apply')} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/16 transition-colors">
                  {slide.secondary}
                </button>
              </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between gap-4">
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
