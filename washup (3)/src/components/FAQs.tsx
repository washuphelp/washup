import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, Mail } from 'lucide-react';
import { faqsData } from '../data/faqs';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Hygiene & Care', 'Services & Speed', 'Pricing & Payment'];

  const filteredFaqs = activeCategory === 'All' 
    ? faqsData 
    : faqsData.filter(faq => faq.category === activeCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faqs"
      className="py-16 md:py-24 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300 border-b border-slate-50 dark:border-slate-900/60"
    >
      <div id="faqs-inner" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div id="faqs-header" className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2">Help Center</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            Have Questions? This is for You
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="font-sans text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Find answers to commonly asked questions about our doorstep washing, dry cleaning care, weights, and pickup schedules.
          </p>
        </div>

        {/* Category Filters */}
        <div id="faqs-filters" className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`faq-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(0); // Reset accordion to first item in new category
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div id="faqs-accordion-list" className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className="bg-slate-50 dark:bg-slate-900/45 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Question Row */}
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display font-extrabold text-base text-slate-900 dark:text-white hover:bg-slate-100/40 dark:hover:bg-slate-900/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4.5 h-4.5 text-cyan-500 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                </button>

                {/* Answer block */}
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed animate-in slide-in-from-top-1 duration-200"
                  >
                    <p className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div id="faqs-footer" className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-tr from-cyan-500/5 to-blue-600/5 border border-cyan-500/10 dark:border-cyan-500/5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Still have questions?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-semibold">We are online 24/7. Reach out via WhatsApp or email directly!</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://wa.me/917838894225?text=Hello%20Washup!%20I%20have%20a%20question%20about%20your%20services."
              target="_blank"
              referrerPolicy="no-referrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-xs"
            >
              <Phone className="w-4 h-4 fill-white stroke-none" />
              WhatsApp: 7838894225
            </a>

            <a
              href="mailto:Washupkr@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-800"
            >
              <Mail className="w-4 h-4" />
              Washupkr@gmail.com
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
