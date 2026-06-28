import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle2, FileText, Send, Sparkles, AlertCircle, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Booking, Service } from '../types';

interface BookingFormProps {
  services: Service[];
  selectedServiceId: string;
  onBookingSuccess: (newBooking: Booking) => void;
}

interface SelectedServiceItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function BookingForm({
  services,
  selectedServiceId,
  onBookingSuccess,
}: BookingFormProps) {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);
  const [pendingSelectId, setPendingSelectId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

  // Success Confirmation State
  const [activeReceipt, setActiveReceipt] = useState<Booking | null>(null);
  const [validationError, setValidationError] = useState('');

  // Set default pending select when services load
  useEffect(() => {
    if (services.length > 0 && !pendingSelectId) {
      setPendingSelectId(services[0].id);
      // Initialize with a default item if empty
      if (selectedItems.length === 0) {
        const defaultService = services.find(s => s.id === 'sandal') || services[0];
        setSelectedItems([
          {
            id: defaultService.id,
            name: defaultService.name,
            price: parseInt(defaultService.price, 10),
            unit: defaultService.unit,
            quantity: 1,
          }
        ]);
      }
    }
  }, [services]);

  // Auto-sync with service selected outside this component
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const service = services.find(s => s.id === selectedServiceId);
      if (service) {
        setSelectedItems(prev => {
          const exists = prev.find(item => item.id === service.id);
          if (exists) {
            return prev;
          }
          return [
            ...prev,
            {
              id: service.id,
              name: service.name,
              price: parseInt(service.price, 10),
              unit: service.unit,
              quantity: 1,
            }
          ];
        });
        setPendingSelectId(selectedServiceId);
      }
    }
  }, [selectedServiceId, services]);

  // Set default tomorrow date on load
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setPickupDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const timeSlots = [
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM',
    '06:00 PM - 09:00 PM',
  ];

  const handleAddItem = (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;

    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === id);
      if (exists) {
        return prev.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          name: service.name,
          price: parseInt(service.price, 10),
          unit: service.unit,
          quantity: 1,
        }
      ];
    });
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, nextQty) };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Field Validation
    if (!customerName.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setValidationError('Please enter a valid 10-digit phone/WhatsApp number.');
      return;
    }
    if (selectedItems.length === 0) {
      setValidationError('Please select at least one service/item for your pickup.');
      return;
    }
    if (!pickupDate) {
      setValidationError('Please pick a convenient date.');
      return;
    }
    if (!address.trim()) {
      setValidationError('Please enter your full pickup address.');
      return;
    }

    const serviceSummary = selectedItems
      .map(item => `${item.name} (${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''})`)
      .join(', ');

    const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const quantitySummary = `${totalQuantity} item${totalQuantity > 1 ? 's' : ''}`;

    const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let estimatedCost = subtotal;

    if (deliveryType === 'express') {
      estimatedCost += 150; // Express surcharge
    }

    // Generate Booking object
    const bookingId = `WP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: bookingId,
      customerName,
      phone,
      serviceId: serviceSummary,
      pickupDate,
      timeSlot,
      address,
      landmark,
      weightEstimate: quantitySummary,
      deliveryType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalCostEstimated: estimatedCost,
    };

    // Save to local list & lift state
    onBookingSuccess(newBooking);
    setActiveReceipt(newBooking);

    // Reset Form Fields
    setCustomerName('');
    setPhone('');
    setAddress('');
    setLandmark('');
  };

  const handleShareToWhatsApp = (booking: Booking) => {
    const serviceName = booking.serviceId;
    const speedText = booking.deliveryType === 'express' ? 'Express 24 Hours (Surcharge Applied)' : 'Standard 48 Hours';
    const message = `*WASHUP PREMIUM PICKUP BOOKING*\n` +
                    `---------------------------------\n` +
                    `*Booking ID:* ${booking.id}\n` +
                    `*Name:* ${booking.customerName}\n` +
                    `*WhatsApp Phone:* ${booking.phone}\n` +
                    `*Services Selected:*\n${serviceName.split(', ').map(s => ` - ${s}`).join('\n')}\n` +
                    `*Pickup Date:* ${booking.pickupDate}\n` +
                    `*Time Slot:* ${booking.timeSlot}\n` +
                    `*Total Quantity:* ${booking.weightEstimate}\n` +
                    `*Delivery Speed:* ${speedText}\n` +
                    `*Address:* ${booking.address}\n` +
                    (booking.landmark ? `*Landmark:* ${booking.landmark}\n` : '') +
                    `*Est. Total Price:* ₹${booking.totalCostEstimated}\n` +
                    `---------------------------------\n` +
                    `Please assign a rider for collection. Thank you!`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/917838894225?text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="pickup-form"
      className="relative overflow-hidden py-16 md:py-24 transition-colors duration-300 border-b border-white/10 bg-transparent"
    >
      <div id="booking-inner" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div id="booking-header" className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2 [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">Book Online</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4 [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
            Schedule Your Premium Pickup
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-6 text-shadow"></div>
          <p className="font-sans text-slate-100 font-semibold leading-relaxed [text-shadow:0_2px_8px_rgba(2,6,23,0.95)]">
            Fill in your doorstep details below. We will handle the heavy lifting while you relax!
          </p>
        </div>

        {/* If booking just created, show gorgeous receipt screen */}
        {activeReceipt ? (
          <div id="receipt-screen" className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/20 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-center text-white relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-5 h-5 mx-auto mb-2 animate-bounce" />
              <h3 className="font-display font-extrabold text-xl">Pickup Request Scheduled!</h3>
              <p className="text-emerald-50 text-xs font-semibold mt-1">Booking ID: {activeReceipt.id}</p>
            </div>

            {/* Receipt Details Body */}
            <div className="p-6 sm:p-8">
              <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Order Summary</span>
              
              <div className="space-y-3.5 text-sm font-semibold">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <span className="text-slate-400">Customer Name</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeReceipt.customerName}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <span className="text-slate-400">WhatsApp Phone</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeReceipt.phone}</span>
                </div>

                <div className="flex flex-col py-2 border-b border-slate-50 dark:border-slate-800/40 gap-1.5">
                  <span className="text-slate-400">Services Ordered</span>
                  <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs bg-cyan-50/20 dark:bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-150/10">
                    {activeReceipt.serviceId.split(', ').map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5 py-0.5">
                        <span className="text-cyan-500">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <span className="text-slate-400">Pickup Schedule</span>
                  <span className="text-slate-800 dark:text-slate-200 text-right">
                    {activeReceipt.pickupDate} <br />
                    <span className="text-xs text-slate-400">{activeReceipt.timeSlot}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <span className="text-slate-400">Weight / Volume</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeReceipt.weightEstimate}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
                  <span className="text-slate-400">Delivery Mode</span>
                  <span className="capitalize text-slate-800 dark:text-slate-200">{activeReceipt.deliveryType}</span>
                </div>

                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Pickup Address</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs block leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-medium border border-slate-100 dark:border-slate-800/40">
                    {activeReceipt.address}
                    {activeReceipt.landmark && <span className="block text-slate-400 mt-1 font-semibold">Landmark: {activeReceipt.landmark}</span>}
                  </span>
                </div>

                {/* Final Estimated Cost */}
                <div className="flex items-center justify-between pt-4 pb-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-base">
                  <span className="text-slate-900 dark:text-white font-extrabold">Est. Total Bill</span>
                  <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">₹{activeReceipt.totalCostEstimated}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  id="whatsapp-receipt-btn"
                  onClick={() => handleShareToWhatsApp(activeReceipt)}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4 fill-white stroke-none" />
                  Confirm on WhatsApp
                </button>

                <button
                  id="book-another-btn"
                  onClick={() => setActiveReceipt(null)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs"
                >
                  Book Another Pickup
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  *Our rider will confirm physical weight on arrival before washing starts. No advance payments required!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Form Display */
          <form
            onSubmit={handleSubmit}
            id="pickup-input-form"
            className="max-w-3xl mx-auto bg-slate-950/45 backdrop-blur-md border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl space-y-8"
          >
            {validationError && (
              <div id="form-validation-alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-2.5 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <p>{validationError}</p>
              </div>
            )}

            {/* Section 1: Customer Details */}
            <div className="space-y-5">
              <span className="block text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">1. Contact Information</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Abhishek Kumar"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> WhatsApp Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="7838894225"
                      className="w-full pl-14 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Service Requirements */}
            <div className="space-y-5">
              <span className="block text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">2. Selected Service Basket</span>
              
              <div className="space-y-4">
                {/* Selected Basket */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 backdrop-blur-md">
                  <div className="px-4.5 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-cyan-400" /> Selected Service Basket ({selectedItems.length})
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Dynamic Estimate</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {selectedItems.length === 0 ? (
                      <div className="p-8 text-center text-slate-300">
                        <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2.5 animate-pulse" />
                        <p className="text-xs font-bold text-white mb-1">Your Basket is Empty</p>
                        <p className="text-[11px] font-medium max-w-xs mx-auto leading-normal">
                          Please choose any of the Premium Services above and click "Book This" to populate your doorstep pickup request.
                        </p>
                      </div>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 bg-transparent hover:bg-white/5 transition-all">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 block mb-0.5">
                              {services.find(s => s.id === item.id)?.category === 'shoe-spa' ? '👟 Shoe Spa' : '👔 Dry Clean'}
                            </span>
                            <span className="text-sm font-extrabold text-white leading-snug">{item.name}</span>
                            <span className="text-[11px] text-slate-300 block mt-0.5 font-semibold">₹{item.price} per {item.unit}</span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2.5 bg-slate-950/60 p-1 rounded-xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-200 border border-white/10 shadow-xs transition-all active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              
                              <span className="font-mono text-xs font-extrabold text-white w-5 text-center">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-200 border border-white/10 shadow-xs transition-all active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Item total and delete */}
                            <div className="flex items-center gap-4.5">
                              <div className="text-right">
                                <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
                                <span className="text-sm font-mono font-extrabold text-white">₹{item.price * item.quantity}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all border border-rose-500/20"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary Footer */}
                  {selectedItems.length > 0 && (
                    <div className="p-4.5 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold">
                      <div className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Pickup Fee: <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Free Drop-off</span></span>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
                        <span className="text-slate-300">Basket Subtotal:</span>
                        <span className="text-base font-mono font-extrabold text-cyan-400">
                          ₹{selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Scheduling */}
            <div className="space-y-5">
              <span className="block text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">3. Pick Your Convenient Slot</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pickup Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  />
                </div>

                {/* Time Slots */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  >
                    {timeSlots.map((slot, idx) => (
                      <option key={idx} value={slot} className="bg-slate-950 text-white">
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Address */}
            <div className="space-y-4">
              <span className="block text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">4. Doorstep Address</span>
              
              <div className="space-y-4">
                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Full Pickup Address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat No, Society/Street name, Sector, Area details"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  ></textarea>
                </div>

                {/* Landmark */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near City Metro Station or opposite block market"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule My Premium Pickup
            </button>
          </form>
        )}

      </div>
    </section>
  );
}
