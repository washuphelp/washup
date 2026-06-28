import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Service } from '../types';

interface ServicesProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

export default function Services({ services, onSelectService }: ServicesProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'shoe-spa' | 'dry-clean'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on active tab and search query
  const filteredServices = services.filter((service) => {
    const matchesTab = activeTab === 'all' || service.category === activeTab;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalShoeSpa = services.filter(s => s.category === 'shoe-spa').length;
  const totalDryClean = services.filter(s => s.category === 'dry-clean').length;


  return (
    <section
      id="services"
      className="py-16 md:py-24 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300 border-b border-slate-50 dark:border-slate-900/60"
    >
      <div id="services-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div id="services-header" className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2">
            STANDARD RATE LIST
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            <span className="block text-black dark:text-white text-lg sm:text-xl font-bold uppercase tracking-wider mb-1">Premium</span>
            Services & Pricing
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            From Delicate Designer Wear to your favorite sneakers
          </p>
        </div>

        {/* Search & Category Filter bar */}
        <div id="services-filter-panel" className="mb-12 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
          
          {/* Tabs */}
          <div className="grid grid-cols-3 md:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('shoe-spa')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'shoe-spa'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icons.Footprints className="w-3.5 h-3.5" />
              Shoe Spa ({totalShoeSpa})
            </button>
            <button
              onClick={() => setActiveTab('dry-clean')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'dry-clean'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icons.Sparkles className="w-3.5 h-3.5" />
              Dry-Clean ({totalDryClean})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Icons.Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search items... (e.g. Saree, Boots, Jeans)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Dynamic Category Labels */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              Showing {filteredServices.length} Premium Options
            </span>
          </div>
          {searchQuery && (
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              Filtered by "{searchQuery}"
            </span>
          )}
        </div>

        {/* Empty state search result */}
        {filteredServices.length === 0 && (
          <div id="services-empty-state" className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-3xl max-w-xl mx-auto">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Icons.HelpCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200 mb-1">
              Custom Fabric or Shoe Type?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 px-6 font-semibold mb-6">
              We clean almost everything! If your specific item is not listed here, get a quick custom quote directly from our support agent on WhatsApp.
            </p>
            <a
              href={`https://wa.me/917838894225?text=Hello%20Washup!%20I%20want%20to%20know%20the%20rate%20for%20cleaning%20an%20item%20not%20listed:%20${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide transition-colors shadow-xs"
            >
              <Icons.Phone className="w-3.5 h-3.5 fill-white stroke-none" />
              Ask on WhatsApp
            </a>
          </div>
        )}

        {/* Services Card Grid */}
        <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service: Service) => {
            // Dynamically load the correct Lucide icon
            const IconComponent = (Icons as any)[service.iconName] || Icons.Sparkles;

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => {
                  onSelectService(service.id);
                  const categoryLabel = service.category === 'shoe-spa' ? 'Shoe Spa 👟' : 'Dry Clean ✨';
                  const message = `*WASHUP PREMIUM BOOKING*\n` +
                                  `---------------------------------\n` +
                                  `*Service:* ${service.name}\n` +
                                  `*Price:* ₹${service.price} / ${service.unit}\n` +
                                  `*Category:* ${categoryLabel}\n` +
                                  `---------------------------------\n` +
                                  `Hello Washup! I would like to book a pickup for this service. Please let me know how to proceed!`;
                  const encodedMessage = encodeURIComponent(message);
                  window.open(`https://wa.me/917838894225?text=${encodedMessage}`, '_blank');
                }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 h-52 w-full cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Background Image / Gradient Fallback */}
                {service.imageUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Rich Dark Gradient Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20 z-0" />
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColorLight} dark:${service.bgColorDark} z-0`} />
                )}

                {/* Top badges (Category + Price) */}
                <div className="relative z-10 p-4 flex items-start justify-between w-full pointer-events-none">
                  {/* Category Badge */}
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider bg-black/60 backdrop-blur-md text-slate-100 border border-white/10 shadow-xs">
                    {service.category === 'shoe-spa' ? '👟 Shoe' : '✨ Dry'}
                  </span>

                  {/* Price Tag Badge */}
                  <div className="text-right bg-black/60 backdrop-blur-md py-0.5 px-2 rounded-lg border border-white/10 text-white shadow-xs flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-black font-display tracking-tight">
                      ₹{service.price}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300">
                      / {service.unit}
                    </span>
                  </div>
                </div>

                {/* Bottom Info Section */}
                <div className="relative z-10 p-4 w-full bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent pt-8">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      
                      {/* Name & Description */}
                      <div className="overflow-hidden">
                        <h3 className="font-display font-extrabold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors leading-tight truncate">
                          {service.name}
                        </h3>
                        <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5 opacity-90">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Interactive quick-book indicator on hover */}
                    <div className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all transform group-hover:scale-110 shrink-0">
                      <Icons.MessageCircle className="w-4 h-4 fill-white/10" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
