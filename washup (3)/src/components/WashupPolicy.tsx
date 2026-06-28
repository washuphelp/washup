import React, { useEffect } from 'react';
import { ShieldAlert, FileText, CheckCircle2, Sparkles, Scale, HeartHandshake, X } from 'lucide-react';

interface WashupPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WashupPolicy({ isOpen, onClose }: WashupPolicyProps) {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="policy-modal-overlay" 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div 
        id="policy-modal-backdrop"
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container Card */}
      <div 
        id="policy-modal-content" 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="policy-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header inside modal */}
        <div id="policy-header" className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h2 className="font-display font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
            Washup Care & Damage Policy
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            At Washup, we handle your garments with supreme care. To ensure mutual transparency, please review our standardized liability and cleaning policy below.
          </p>
        </div>

        {/* Main Highlight Card */}
        <div 
          id="policy-main-card" 
          className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm overflow-hidden mb-6"
        >
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            
            <div className="space-y-3 flex-1">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
                Standard Cleaning Liability Limit (20% Recovery)
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                While our laundry experts employ state-of-the-art washing, dry cleaning, and ironing systems, garments can occasionally experience structural wear. In the extremely rare event that any clothing or product is burned, torn, stained, or damaged during our standard cleaning cycle, <span className="text-amber-600 dark:text-amber-400 font-bold">Washup&apos;s maximum liability is limited to 20% of the item&apos;s proven original purchase value</span>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Allows highly affordable doorstep pricing.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Applies to all fabrics, cottons & linens.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplementary Guidelines Grid */}
        <div id="policy-guidelines-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl p-4 flex gap-3">
            <HeartHandshake className="w-4.5 h-4.5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[10px] text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                Luxury / High-Value Items
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                For extremely high-value designer garments, silk sarees, or premium leathers, please notify our team at pick-up so we can recommend customized premium care protocols.
              </p>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl p-4 flex gap-3">
            <FileText className="w-4.5 h-4.5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[10px] text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                Pre-Inspection Protocol
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Our pickup agents inspect all garments for pre-existing tears, missing buttons, or severe discoloration. Findings will be updated prior to washing.
              </p>
            </div>
          </div>
        </div>

        {/* Policy footnote */}
        <div id="policy-footnote" className="mt-6 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/40 pt-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>By booking a pickup, you acknowledge and agree to the 20% max damage policy.</span>
        </div>

        {/* OK / Agree Button */}
        <div id="policy-footer-action" className="mt-5 flex justify-end">
          <button
            id="policy-agree-btn"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all"
          >
            I Acknowledge & Agree
          </button>
        </div>

      </div>
    </div>
  );
}
