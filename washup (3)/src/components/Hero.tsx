import React from 'react';
import { MessageCircle, Clock3, Sparkles, Phone, ShieldCheck, Star, Tag, MapPin } from 'lucide-react';

interface HeroProps {
  onScrollTo: (id: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-transparent"
    >
      {/* Background Decorative Bubble Elements */}
      <div id="bg-bubbles-layer" className="absolute inset-0 pointer-events-none select-none z-0">
        <div id="bubble-dec-1" className="absolute w-72 h-72 rounded-full bg-cyan-100/40 dark:bg-cyan-950/10 -top-12 -left-12 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div id="bubble-dec-2" className="absolute w-96 h-96 rounded-full bg-blue-100/30 dark:bg-blue-950/5 -bottom-24 -right-12 blur-3xl" style={{ animationDuration: '9s' }}></div>
        
        {/* Floating small bubbles */}
        <div className="absolute w-4 h-4 rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 top-1/4 left-10 animate-bounce" style={{ animationDuration: '3.5s' }}></div>
        <div className="absolute w-6 h-6 rounded-full bg-blue-400/15 dark:bg-blue-500/5 top-2/3 left-1/4 animate-bounce" style={{ animationDuration: '4.5s' }}></div>
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400/30 dark:bg-cyan-500/15 top-1/3 right-1/4 animate-bounce" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute w-5 h-5 rounded-full bg-blue-400/20 dark:bg-blue-500/10 top-1/2 right-12 animate-bounce" style={{ animationDuration: '5.5s' }}></div>
      </div>

      <div id="hero-inner" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div id="hero-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div id="hero-content" className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div
              id="hero-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)] text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" style={{ animationDuration: '8s' }} />
              India's Only 24-Hour Service
            </div>

            <h1
              id="hero-title"
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none mb-6 [text-shadow:0_4px_16px_rgba(2,6,23,0.95)]"
            >
              Your 24-Hour <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(2,6,23,0.8)]">
                Dry Cleaning & Shoe Spa
              </span>
            </h1>

            <p
              id="hero-description"
              className="font-sans text-base sm:text-lg text-slate-100 max-w-xl mb-8 leading-relaxed font-semibold [text-shadow:0_2px_12px_rgba(2,6,23,0.98)]"
            >
              Get Free Pickup & Delivery, Eco-Friendly Cleaning, And Updates On Whatsapp. Experience Pristine Garments And Restored Sneakers In Just One Day.
            </p>

            <div id="hero-ctas" className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                id="hero-cta-whatsapp"
                href="https://wa.me/917838894225?text=Hello%20Washup!%20I%20want%20to%20book%20a%2024-hour%20pickup."
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2 uppercase"
              >
                <Phone className="w-4 h-4 fill-white stroke-none" />
                BOOK YOUR 24-HOUR PICKUP ON WHATSAPP
              </a>

              <button
                id="hero-cta-book"
                onClick={() => onScrollTo('services')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-white hover:border-cyan-300 text-white hover:text-cyan-300 font-bold text-base active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <Tag className="w-5 h-5" />
                Check Rates
              </button>
            </div>

            {/* Quick trust metrics */}
            <div id="hero-trust-row" className="flex items-center gap-6 mt-10 text-white text-xs font-semibold [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                4.8/5 Based on 6,500+ Reviews
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Serving Delhi, Gurgaon, Noida & Gaziabad
              </span>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div id="hero-visual" className="lg:col-span-5 relative flex items-center justify-center">
            {/* Elegant small website logo with details below - completely transparent background */}
            <div id="hero-card" className="relative p-6 w-full max-w-sm text-center flex flex-col items-center justify-center select-none bg-transparent">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-105 transition-transform duration-300 mb-4">
                <svg className="w-8 h-8 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <p className="text-sm md:text-base font-bold tracking-widest text-cyan-400 uppercase [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
                Your 24-Hour Clean
              </p>
              <p className="text-xs md:text-sm font-semibold text-slate-100 mt-1 [text-shadow:0_2px_6px_rgba(2,6,23,0.95)]">
                In 3 Simple Steps
              </p>
            </div>
          </div>
          
        </div>

        {/* Floating Quick Features */}
        <div id="hero-features-strip" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div id="hero-feature-1" className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 fill-emerald-500/10" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Book On Chat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Tap the button to suchedule your free pickup. No Calls , No Hassle.</p>
            </div>
          </div>

          <div id="hero-feature-2" className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Clock3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">24-Hour Delivery</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Your Freash, Clean Items Are Delivered Back Within 24-Hour Guranted.</p>
            </div>
          </div>

          <div id="hero-feature-3" className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Premium Fabric Soft Water</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Processed in zero-hardness water for softness.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
