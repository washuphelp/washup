import React from 'react';

export default function WhatsAppButton() {
  // You can customize this WhatsApp link with your target phone number and standard welcome message
  const whatsappNumber = "917838894225"; // Configured with the user's requested number
  const welcomeMessage = encodeURIComponent("Hello Washup! I would like to book a laundry service or make an inquiry.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${welcomeMessage}`;

  return (
    <div 
      id="whatsapp-fab-container" 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group"
    >
      {/* Tooltip text - visible on hover or gracefully animated */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-tooltip"
        className="px-3 py-1.5 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-lg border border-slate-800 dark:border-slate-100 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        Need Help? Chat on WhatsApp
      </a>

      {/* Floating Action Button (FAB) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-fab"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.35)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1"
        aria-label="Chat on WhatsApp"
      >
        {/* Ambient Ringing Pulse */}
        <span className="absolute inset-0 w-full h-full rounded-full bg-emerald-500/30 animate-ping scale-105 opacity-75 pointer-events-none" />

        {/* WhatsApp High-fidelity SVG Icon */}
        <svg 
          className="w-7 h-7 fill-white drop-shadow-sm" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
