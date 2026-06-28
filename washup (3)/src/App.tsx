import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Locations from './components/Locations';
import WashupPolicy from './components/WashupPolicy';
import WhyChooseUs from './components/WhyChooseUs';
import BookingForm from './components/BookingForm';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BookingsDrawer from './components/BookingsDrawer';
import { Booking } from './types';
import WhatsAppButton from './components/WhatsAppButton';
import { useFirestoreData } from './lib/useFirestoreData';
import AdminPanel from './components/AdminPanel';
import ThreeBackground from './components/ThreeBackground';

export default function App() {
  const { 
    services, 
    locations, 
    bookings,
    orders,
    loading: isFirestoreLoading, 
    saveService, 
    removeService, 
    saveLocation, 
    removeLocation,
    saveBooking,
    removeBooking,
    saveOrder,
    removeOrder,
    forceCloudSync,
    syncStatus
  } = useFirestoreData();

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL query parameters on mount to auto-open admin if '?admin=true' is entered
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }
  }, []);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('washup_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('wash-fold');

  // Sync dark mode class on DOM element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('washup_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('washup_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Scroll smoothly to target element
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Select service from card and scroll to booking form
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    handleScrollTo('pickup-form');
  };

  // Success Booking handler
  const handleBookingSuccess = async (newBooking: Booking) => {
    try {
      await saveBooking(newBooking);
      // Optionally open the tracker automatically
      setTimeout(() => {
        setIsBookingsOpen(true);
      }, 1500);
    } catch (err) {
      console.error("Failed to sync booking to Firestore:", err);
    }
  };

  // Update Status handler (for Simulation stepper)
  const handleUpdateStatus = async (bookingId: string, nextStatus: Booking['status']) => {
    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    if (bookingToUpdate) {
      try {
        await saveBooking({ ...bookingToUpdate, status: nextStatus });
      } catch (err) {
        console.error("Failed to update booking status on Firestore:", err);
      }
    }
  };

  // Delete Booking handler
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await removeBooking(bookingId);
    } catch (err) {
      console.error("Failed to delete booking from Firestore:", err);
    }
  };

  return (
    <div id="washup-root" className="min-h-screen font-sans bg-transparent text-slate-800 dark:text-slate-200 transition-colors duration-300 antialiased selection:bg-cyan-500 selection:text-white relative">
      {/* Base Solid Backdrop layer behind the WebGL Canvas */}
      <div className="fixed inset-0 bg-white dark:bg-slate-950 -z-20 transition-colors duration-300" />

      {/* Premium Interactive 3D WebGL Background */}
      <ThreeBackground />

      {/* Header Bar */}
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        bookings={bookings}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onScrollTo={handleScrollTo}
        onOpenPolicy={() => setIsPolicyOpen(true)}
      />

      {/* Hero Intro Section */}
      <Hero onScrollTo={handleScrollTo} />

      {/* Main Services Grid Block */}
      <Services services={services} onSelectService={handleSelectService} />

      {/* Delhi NCR Coverage Locations Area */}
      <Locations locations={locations} />

      {/* Washup Liability Care & Damage Policy (Modal) */}
      <WashupPolicy isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />

      {/* Core Advantages Block */}
      <WhyChooseUs />

      {/* Interactive Doorstep Pickup Booking Form */}
      <BookingForm
        services={services}
        selectedServiceId={selectedServiceId}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Customer Review Feedback Carousel/Bento */}
      <Reviews />

      {/* Footer Support and Social Column bar */}
      <Footer services={services} onScrollTo={handleScrollTo} onOpenPolicy={() => setIsPolicyOpen(true)} />

      {/* Lateral Sliding Dashboard panel for active bookings tracking */}
      <BookingsDrawer
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        bookings={bookings}
        services={services}
        onUpdateStatus={handleUpdateStatus}
        onDeleteBooking={handleDeleteBooking}
      />

      {/* Secure Cryptographic Admin Console */}
      {isAdminOpen && (
        <AdminPanel
          services={services}
          locations={locations}
          orders={orders || []}
          onSaveService={saveService}
          onRemoveService={removeService}
          onSaveLocation={saveLocation}
          onRemoveLocation={removeLocation}
          onSaveOrder={saveOrder}
          onRemoveOrder={removeOrder}
          onClose={() => setIsAdminOpen(false)}
          onForceSync={forceCloudSync}
          syncStatus={syncStatus}
        />
      )}

      {/* WhatsApp Chat Floating Action Button */}
      <WhatsAppButton />
    </div>
  );
}

