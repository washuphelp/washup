import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Calendar, ChevronDown, Clock3, MessageSquare, ShieldCheck, MapPin, Sparkles, ThumbsUp } from 'lucide-react';
import { Booking } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  bookings: Booking[];
  onOpenBookings: () => void;
  onScrollTo: (id: string) => void;
  onOpenPolicy: () => void;
}

export default function Header({
  isDarkMode,
  toggleTheme,
  bookings,
  onOpenBookings,
  onScrollTo,
  onOpenPolicy,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const navItems = [
    { name: 'Our Services', id: 'services', icon: <Sparkles className="w-4 h-4 text-purple-500 shrink-0" /> },
    { name: 'Why Choose Us', id: 'why-choose-us', icon: <ThumbsUp className="w-4 h-4 text-blue-500 shrink-0" /> },
    { name: 'Contact Us', id: 'contact', icon: <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" /> },
  ];

  return (
    <header id="header-container" className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div id="header-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo & Explore Menu */}
        <div id="header-left" className="flex items-center gap-6">
          {/* Logo */}
          <button
            id="logo-button"
            onClick={() => onScrollTo('hero')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div id="logo-icon-wrapper" className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1A8CFF] text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              <svg className="w-5.5 h-5.5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div id="logo-text" className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                WASHUP
              </span>
            </div>
          </button>

          {/* Explore Menu button next to logo */}
          <div id="explore-menu-wrapper" className="relative hidden md:block">
            <button
              id="explore-dropdown-btn"
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Explore Menu
              <ChevronDown className={`w-4 h-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExploreOpen && (
              <>
                <div id="explore-backdrop" className="fixed inset-0 z-10" onClick={() => setIsExploreOpen(false)}></div>
                <div id="explore-dropdown" className="absolute left-0 mt-2.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="block px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Navigation</span>
                  </div>
                  <div className="p-1 flex flex-col gap-0.5">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        id={`explore-nav-${item.id}`}
                        onClick={() => {
                          onScrollTo(item.id);
                          setIsExploreOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium flex items-center gap-2"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
                    <button
                      id="explore-terms-btn"
                      onClick={() => {
                        onOpenPolicy();
                        setIsExploreOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Terms & Conditions</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div id="header-right" className="flex items-center gap-3">
          {/* Theme Toggle (Hidden) */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="hidden"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Book Pickup Button (Hidden) */}
          <button
            id="book-pickup-header-btn"
            onClick={() => onScrollTo('pickup-form')}
            className="hidden"
          >
            <Calendar className="w-4 h-4" />
            Book Pickup
          </button>

          {/* Mobile Menu Icon */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-full md:hidden text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div id="mobile-drawer" className="md:hidden border-t border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onScrollTo(item.id);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            <button
              id="mobile-nav-terms"
              onClick={() => {
                onOpenPolicy();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Terms & Conditions</span>
            </button>
          </div>

          <hr className="border-slate-100 dark:border-slate-900" />

          <div className="flex flex-col gap-2">
            <button
              id="mobile-book-pickup"
              onClick={() => {
                onScrollTo('pickup-form');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-md"
            >
              <Calendar className="w-4 h-4" />
              Book Premium Pickup
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
