import React from 'react';
import { X, Clock, MapPin, Phone, RefreshCw, CheckCircle2, AlertCircle, FileText, Share2 } from 'lucide-react';
import { Booking, Service } from '../types';

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  services: Service[];
  onUpdateStatus: (bookingId: string, nextStatus: Booking['status']) => void;
  onDeleteBooking: (bookingId: string) => void;
}

export default function BookingsDrawer({
  isOpen,
  onClose,
  bookings,
  services,
  onUpdateStatus,
  onDeleteBooking,
}: BookingsDrawerProps) {
  if (!isOpen) return null;

  const getStatusDetails = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Rider Assigning', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', step: 1 };
      case 'confirmed':
        return { label: 'Rider Scheduled', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', step: 2 };
      case 'picked_up':
        return { label: 'In Transit to Hub', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', step: 3 };
      case 'processing':
        return { label: 'Washing/Ironing', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', step: 4 };
      case 'delivered':
        return { label: 'Clean & Delivered', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', step: 5 };
      default:
        return { label: 'Scheduled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', step: 1 };
    }
  };

  const advanceStatus = (booking: Booking) => {
    const statuses: Booking['status'][] = ['pending', 'confirmed', 'picked_up', 'processing', 'delivered'];
    const currentIndex = statuses.indexOf(booking.status);
    if (currentIndex < statuses.length - 1) {
      onUpdateStatus(booking.id, statuses[currentIndex + 1]);
    } else {
      // Loop back to pending for simulation
      onUpdateStatus(booking.id, 'pending');
    }
  };

  return (
    <div id="bookings-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div id="bookings-drawer-panel" className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-100 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                My Active Pickups ({bookings.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bookings List Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {bookings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 mb-4 animate-pulse">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-slate-700 dark:text-slate-300 mb-1">No Bookings Found</h3>
                <p className="text-xs max-w-xs font-semibold leading-relaxed">
                  You haven't scheduled any pickups in this session yet. Use our scheduler to book your first free collection!
                </p>
              </div>
            ) : (
              bookings.map((booking) => {
                const service = services.find((s) => s.id === booking.serviceId);
                const statusInfo = getStatusDetails(booking.status);

                return (
                  <div
                    key={booking.id}
                    id={`drawer-booking-${booking.id}`}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 space-y-4"
                  >
                    {/* ID and Status badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">{booking.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Service Name & Pricing estimate */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Requested Services</span>
                      <div className="flex flex-wrap gap-1.5">
                        {booking.serviceId.split(', ').map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 text-[11px] font-extrabold rounded-lg border border-cyan-100/20">
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 flex items-center justify-between">
                        <span>Total Items: <span className="font-mono text-slate-900 dark:text-white font-extrabold">{booking.weightEstimate}</span></span>
                        <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">₹{booking.totalCostEstimated}</span>
                      </p>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Schedule detail */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Pickup Date</span>
                        <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">{booking.pickupDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Time Slot</span>
                        <span className="text-slate-800 dark:text-slate-200 mt-0.5 block text-right">{booking.timeSlot}</span>
                      </div>
                    </div>

                    {/* Stepper Timeline Visual */}
                    <div className="pt-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Delivery Progress</span>
                      <div className="flex items-center justify-between relative mt-1">
                        {/* Stepper horizontal track */}
                        <div className="absolute left-0 right-0 top-2.5 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
                        <div className="absolute left-0 top-2.5 h-0.5 bg-cyan-500 transition-all duration-300 z-0" style={{ width: `${((statusInfo.step - 1) / 4) * 100}%` }}></div>

                        {/* Step Dots */}
                        {Array.from({ length: 5 }).map((_, stepIdx) => {
                          const stepNum = stepIdx + 1;
                          const isActive = stepNum <= statusInfo.step;
                          const isCurrent = stepNum === statusInfo.step;

                          return (
                            <div
                              key={stepIdx}
                              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center z-10 transition-all ${
                                isActive
                                  ? 'bg-cyan-500 text-white font-bold scale-110 shadow-sm shadow-cyan-500/20'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              } text-[9px]`}
                              title={`Step ${stepNum}`}
                            >
                              {isActive && stepNum < statusInfo.step ? '✓' : stepNum}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Address block */}
                    <div className="text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 leading-normal font-medium">{booking.address}</span>
                    </div>

                    {/* Interactive Simulator Controller */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => advanceStatus(booking)}
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-cyan-100/30 dark:border-cyan-900/20"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                        Simulate Next Status Step
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const waMsg = `*WASHUP ORDER STATUS ENQUIRY*\n` +
                                          `---------------------------------\n` +
                                          `Booking ID: ${booking.id}\n` +
                                          `Name: ${booking.customerName}\n` +
                                          `Current Status: ${statusInfo.label}\n` +
                                          `Please update me on delivery. Thank you!`;
                            window.open(`https://wa.me/917838894225?text=${encodeURIComponent(waMsg)}`, '_blank');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                          Ping Status
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this scheduled pickup?')) {
                              onDeleteBooking(booking.id);
                            }
                          }}
                          className="py-2.5 px-3 rounded-xl bg-rose-50/20 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          Cancel Pickup
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {bookings.length > 0 && (
            <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center text-xs text-slate-400 font-semibold leading-relaxed">
              Active pickups are saved in your local cache. If you cleared your browser data, they will be deleted. For live tracking, ping us on WhatsApp!
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
