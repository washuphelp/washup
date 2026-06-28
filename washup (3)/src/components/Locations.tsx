import React from 'react';
import { MapPin, Map, Sparkles } from 'lucide-react';
import { LocationDivision } from '../types';

interface LocationsProps {
  locations: LocationDivision[];
}

export default function Locations({ locations }: LocationsProps) {
  return (
    <section
      id="locations-section"
      className="py-16 md:py-24 bg-transparent transition-colors duration-300 border-b border-white/10"
    >
      <div id="locations-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div id="locations-header" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] font-semibold text-xs uppercase tracking-widest mb-4">
            <Map className="w-3.5 h-3.5" />
            Service Network
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
            Currently Servicing
          </h2>
          <p className="mt-4 text-base text-slate-100 font-medium [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
            We offer doorstep pickup and delivery services across major residential, commercial, and enterprise sectors.
          </p>
        </div>

        {/* Dynamic Coverage Grid */}
        <div id="locations-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {locations.map((city) => (
            <div
              key={city.id}
              id={`city-card-${city.id}`}
              className="bg-slate-950/40 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-cyan-400 shrink-0 border border-white/10">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white leading-tight">
                        {city.name}
                      </h3>
                      <p className="text-[10px] text-cyan-300 mt-1 font-medium leading-none">24-Hrs Delivery</p>
                    </div>
                  </div>
                  {city.popular && (
                    <span className="text-[8px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footnote */}
        <div id="locations-footnote" className="mt-12 text-center flex items-center justify-center gap-2 text-xs text-slate-100 font-semibold [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Free doorstep pickup and delivery is fully integrated on all orders within our serviced sectors.</span>
        </div>

      </div>
    </section>
  );
}
