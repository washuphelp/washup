import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle, Sparkles, User, MapPin, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { testimonialsData } from '../data/testimonials';
import { Testimonial } from '../types';
import { db, collection, addDoc, getDocs, query, orderBy, limit } from '../lib/firebase';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

export default function Reviews() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5); // Default to 5
  const [text, setText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews from Firestore + fall back / merge with default testimonials
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Get custom reviews from Firebase Firestore
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(30));
        const querySnapshot = await getDocs(q);
        
        const fetchedCustomReviews: Testimonial[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Safely extract date or fall back to 'Recent'
          let dateStr = 'Recent';
          if (data.createdAt) {
            const dateObj = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
            dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          }

          fetchedCustomReviews.push({
            id: doc.id,
            name: data.name || 'Valued Customer',
            location: data.location || 'India',
            rating: Number(data.rating) || 5,
            text: data.text || '',
            avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80',
            date: dateStr
          });
        });

        // Combine custom database reviews (newest first) with default high-quality static testimonials
        // We filter out any defaults that may have identical text to avoid duplication
        const combined = [...fetchedCustomReviews, ...testimonialsData.filter(
          t => !fetchedCustomReviews.some(c => c.text.toLowerCase().trim() === t.text.toLowerCase().trim())
        )];
        setReviews(combined);
      } catch (error) {
        console.error("Error fetching reviews from Firestore: ", error);
        // Fallback to local storage or defaults
        const saved = localStorage.getItem('washup_customer_reviews');
        if (saved) {
          try {
            setReviews(JSON.parse(saved));
          } catch (e) {
            setReviews(testimonialsData);
          }
        } else {
          setReviews(testimonialsData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Force rating to be strictly between 2 and 5 stars
    const finalRating = Math.max(2, Math.min(5, rating));

    // Array of high-quality avatars representing different users
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newReviewData = {
      name: name.trim(),
      location: location.trim(),
      rating: finalRating,
      text: text.trim(),
      avatarUrl: randomAvatar,
    };

    try {
      // 1. Save to cloud Firestore database so all devices see it!
      const reviewsRef = collection(db, 'reviews');
      const docRef = await addDoc(reviewsRef, {
        ...newReviewData,
        createdAt: serverTimestamp() // Official Firestore Server Timestamp
      });

      // 2. Add to active state instantly for the user
      const instantReview: Testimonial = {
        id: docRef.id,
        name: newReviewData.name,
        location: newReviewData.location,
        rating: newReviewData.rating,
        text: newReviewData.text,
        avatarUrl: newReviewData.avatarUrl,
        date: 'Just now'
      };

      const updated = [instantReview, ...reviews];
      setReviews(updated);
      
      // Keep localStorage as local fast-loader cache
      localStorage.setItem('washup_customer_reviews', JSON.stringify(updated));
      
      setIsSubmitted(true);

      // Reset form with an elegant delay
      setTimeout(() => {
        setName('');
        setLocation('');
        setRating(5);
        setText('');
        setIsSubmitted(false);
        setShowForm(false);
      }, 1800);

    } catch (error) {
      console.error("Error writing document to cloud database: ", error);
      // Local fallback if offline or db error
      const localId = `custom-${Date.now()}`;
      const instantReview: Testimonial = {
        id: localId,
        name: newReviewData.name,
        location: newReviewData.location,
        rating: newReviewData.rating,
        text: newReviewData.text,
        avatarUrl: newReviewData.avatarUrl,
        date: 'Just now'
      };
      const updated = [instantReview, ...reviews];
      setReviews(updated);
      localStorage.setItem('washup_customer_reviews', JSON.stringify(updated));
      setIsSubmitted(true);

      setTimeout(() => {
        setName('');
        setLocation('');
        setRating(5);
        setText('');
        setIsSubmitted(false);
        setShowForm(false);
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Human readable description for custom 2-5 rating options
  const getRatingLabel = (val: number) => {
    switch (val) {
      case 2: return 'Good (Satisfactory Care)';
      case 3: return 'Great (Highly Professional)';
      case 4: return 'Excellent (Ultra-Clean & Neat)';
      case 5: return 'Elite (Absolute Perfection!)';
      default: return 'Excellent';
    }
  };

  return (
    <section
      id="reviews"
      className="py-16 md:py-24 bg-slate-50/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300 border-b border-slate-100 dark:border-slate-900/60"
    >
      <div id="reviews-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div id="reviews-header" className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2">Customer Delight</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            What Our Customers Say
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="font-sans text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Don't just take our word for it. Hundreds of busy professionals, homemakers, and dry-clean enthusiasts choose Washup daily.
          </p>

          {/* Trigger button for adding user review */}
          <button
            type="button"
            id="write-review-toggle-btn"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm tracking-wide shadow-md shadow-cyan-500/10 hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
            {showForm ? 'Close Form' : 'Share Your Experience'}
          </button>
        </div>

        {/* Expandable Review submission Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              id="review-form-container"
              initial={{ opacity: 0, height: 0, y: -15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden mb-12 max-w-xl mx-auto"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-lg">
                
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center" id="review-success-state">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle className="w-8 h-8 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Review Submitted!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thank you for helping us elevate the wash standard.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" id="customer-review-input-form">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share Washup Love</span>
                    </div>

                    {/* Customer Info row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rohan Patel"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sector 15, Noida"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom 2-Star to 5-Star interactive Selector */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                        Rating Score (2 to 5 Stars)
                      </label>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-3.5 rounded-2xl">
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {/* Stars from 2 to 5 */}
                            {[2, 3, 4, 5].map((starValue) => {
                              const isActive = rating >= starValue;
                              return (
                                <button
                                  key={starValue}
                                  type="button"
                                  onClick={() => setRating(starValue)}
                                  className="p-1 hover:scale-115 transition-transform active:scale-90"
                                >
                                  <Star
                                    className={`w-7 h-7 ${
                                      isActive
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-slate-200 dark:text-slate-800 fill-transparent'
                                    } transition-colors`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Selected Rating label */}
                          <div className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                              {rating} Star{rating > 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block">
                              {getRatingLabel(rating)}
                            </span>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                          Note: Ratings are restricted to 2-5 stars to match our guarantee of high-grade washing and care standards!
                        </p>
                      </div>
                    </div>

                    {/* Review text comment block */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Your Review</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          required
                          rows={3}
                          placeholder="Tell others about your fabric freshness, shoe-spa quality, packaging, or speed..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-md shadow-cyan-500/10 active:scale-98 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Submit Review
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Testimonials Bento/Card Grid */}
        <div id="reviews-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((test) => (
            <div
              key={test.id}
              id={`review-card-${test.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Star rating row */}
                <div className="flex items-center gap-0.5 mb-4 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 fill-current ${
                        idx < Math.floor(test.rating) ? 'text-amber-500' : 'text-slate-200 dark:text-slate-800/60'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-1.5">
                    {test.rating}
                  </span>
                </div>

                {/* Review Text */}
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6">
                  "{test.text}"
                </p>
              </div>

              {/* User Bio Footer */}
              <div id="review-user-bio" className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                <img
                  src={test.avatarUrl}
                  alt={test.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {test.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5 truncate">
                    {test.location} • {test.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
