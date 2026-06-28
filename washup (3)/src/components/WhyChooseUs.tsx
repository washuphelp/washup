import React from 'react';
import { ShieldCheck, Truck, Droplet, Sparkles, Scale, RefreshCw } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: "100% Separated Hygienic Washing",
      description: "We strictly value hygiene. Your clothes are washed separately in independent machine batches. We never mix your items with any other client's laundry.",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: Droplet,
      title: "Advanced Soft Water Cleansing",
      description: "Hard water damages fabrics and causes colors to fade. WashUp uses specialized soft-water filters which preserve garment shine and keep them extremely soft.",
      color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
    },
    {
      icon: Truck,
      title: "Free Doorstep Pickup & Delivery",
      description: "Schedule at your convenience. Our friendly logistics riders collect and return your laundry at your selected time slot completely free of charge.",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: Sparkles,
      title: "Eco-Friendly, Non-Toxic Detergents",
      description: "We care for your skin and the environment. We use organic, hypoallergenic, and enzyme-active cleaning agents that are gentle on fabrics and zero-toxic.",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30"
    },
    {
      icon: Scale,
      title: "Transparent Weighing at Doorstep",
      description: "No hidden weight calculations or billing surprises. Our riders carry certified electronic hanging scales to weigh your clothes in front of you.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
    },
    {
      icon: RefreshCw,
      title: "100% Delight Guarantee",
      description: "Fabric care is our pride. If you are not completely satisfied with our washing or ironing quality, we will reprocess your garment free of any charge.",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
    }
  ];

  return (
    <section
      id="why-choose-us"
      className="py-16 md:py-24 bg-transparent transition-colors duration-300"
    >
      <div id="why-choose-us-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div id="why-choose-us-header" className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2">Our Core Invariants</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            Why Choose WashUp?
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="font-sans text-white font-medium leading-relaxed">
            We are redefining home laundry by offering an absolute zero-compromise experience on hygiene, care, transparency, and timely delivery.
          </p>
        </div>

        {/* Features Grid */}
        <div id="why-choose-us-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                id={`why-choose-card-${index}`}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl hover:shadow-md transition-shadow flex flex-col items-start"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-3">
                  {feat.title}
                </h3>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
