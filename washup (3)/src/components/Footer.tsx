import React from 'react';
import { Phone, Mail, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { Service } from '../types';

interface FooterProps {
  services: Service[];
  onScrollTo: (id: string) => void;
  onOpenPolicy: () => void;
}

export default function Footer({ services, onScrollTo, onOpenPolicy }: FooterProps) {
  return (
    <footer
      id="contact"
      className="bg-slate-950/80 backdrop-blur-md text-slate-400 py-16 transition-colors duration-300 border-t border-slate-900"
    >
      <div id="footer-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="footer-grid" className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-6">
            <button
              onClick={() => onScrollTo('hero')}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1A8CFF] text-white shadow-md shadow-blue-500/25">
                <svg className="w-5.5 h-5.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white leading-none">
                WASHUP
              </span>
            </button>

            <p className="font-sans text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
              India’s premier on-demand laundry and dry cleaning ecosystem. Delivering freshly sanitized, crisply folded garments straight to your doorstep within 48 hours.
            </p>

            {/* Social Icons row */}
            <div className="flex items-center gap-3 pt-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/917838894225"
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors text-slate-300"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4 fill-current stroke-none" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/washupkr?utm_source=qr&igsh=MXdrNmtqZ3Q5MWZ3ZA%3D%3D"
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Washup-Kr/pfbid0RiX2Po3saenr8RR24bc34b4EttFLEAg4E5c2y3WBuVcikuXVQipwaRK6tjHcnoHul/?rdid=8tUYQJa4qLYzdArt&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DwnaESSFE%2F"
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              {/* Gmail */}
              <a
                href="mailto:Washupkr@gmail.com"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-slate-300"
                aria-label="Gmail"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Service Categories */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Service Categories
            </h3>
            <div className="w-8 h-0.5 bg-cyan-500 rounded-full mb-4"></div>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-cyan-500 transition-colors text-left flex items-center gap-1 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-cyan-500" />
                  Shoes Spa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-cyan-500 transition-colors text-left flex items-center gap-1 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-cyan-500" />
                  Dry-Clean
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Still have Questions? */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Still have Questions?
            </h3>
            <div className="w-8 h-0.5 bg-cyan-500 rounded-full mb-4"></div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
              We are online 24/7. Reach out via WhatsApp or email directly!
            </p>
            <div className="flex flex-col gap-2 pt-1 max-w-[240px]">
              <a
                href="https://wa.me/917838894225?text=Hello%20Washup!%20I%20have%20a%20question%20about%20your%20services."
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 fill-white stroke-none" />
                <span>WhatsApp: 7838894225</span>
              </a>
              <a
                href="mailto:Washupkr@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs border border-slate-800 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-500" />
                <span>Washupkr@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Legal Bottom Bar */}
        <div id="footer-bottom" className="mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <p>© Washup. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <button
              id="footer-terms-btn"
              onClick={onOpenPolicy}
              className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none font-bold"
            >
              Terms & Conditions
            </button>
            <p className="flex items-center gap-1">
              Made with <span className="text-rose-500 animate-pulse">❤️</span> for premium fabrics across India.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
