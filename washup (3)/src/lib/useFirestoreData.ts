import { useState, useEffect } from 'react';
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from './firebase';
import { Service, LocationDivision, Booking, Order } from '../types';
import { servicesData } from '../data/services';
import { locationsData } from '../data/locations';

export function useFirestoreData() {
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<LocationDivision[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // 1. Subscribe to Services (Real-Time) with safe seeding
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    async function initServices() {
      try {
        const servicesRef = collection(db, 'services');
        const querySnapshot = await getDocs(servicesRef);

        // Seed if empty, or sync updated local properties (like imageUrl) to Firestore
        if (querySnapshot.empty) {
          console.log("Firestore services collection is empty. Seeding initial services...");
          const seedPromises = servicesData.map((service) => 
            setDoc(doc(db, 'services', service.id), service)
          );
          await Promise.all(seedPromises);
        } else {
          // If Firestore is already seeded, check if any of our local service images or core details have changed
          const currentDbServices: Record<string, any> = {};
          querySnapshot.forEach((docSnapshot) => {
            currentDbServices[docSnapshot.id] = docSnapshot.data();
          });

          const syncPromises = [];
          for (const staticService of servicesData) {
            const dbService = currentDbServices[staticService.id];
            if (!dbService) {
              // Completely new service added locally, write to Firestore
              syncPromises.push(setDoc(doc(db, 'services', staticService.id), staticService));
            } else if (
              dbService.imageUrl !== staticService.imageUrl ||
              dbService.name !== staticService.name ||
              dbService.price !== staticService.price ||
              dbService.description !== staticService.description ||
              dbService.unit !== staticService.unit
            ) {
              // Service properties modified locally, propagate to Firestore
              console.log(`Syncing updated properties for service ${staticService.id} to Firestore`);
              syncPromises.push(setDoc(doc(db, 'services', staticService.id), {
                ...dbService,
                name: staticService.name,
                price: staticService.price,
                description: staticService.description,
                imageUrl: staticService.imageUrl,
                unit: staticService.unit,
                features: staticService.features,
                category: staticService.category,
                iconName: staticService.iconName,
                bgColorLight: staticService.bgColorLight,
                bgColorDark: staticService.bgColorDark
              }));
            }
          }
          if (syncPromises.length > 0) {
            await Promise.all(syncPromises);
          }
        }

        if (!isMounted) return;

        // Subscribe to real-time updates
        unsubscribe = onSnapshot(servicesRef, (snapshot) => {
          const servicesList: Service[] = [];
          snapshot.forEach((doc) => {
            servicesList.push({ id: doc.id, ...doc.data() } as Service);
          });
          
          // Sort according to the static servicesData order to maintain consistency
          servicesList.sort((a, b) => {
            const indexA = servicesData.findIndex(s => s.id === a.id);
            const indexB = servicesData.findIndex(s => s.id === b.id);
            const posA = indexA === -1 ? 999 : indexA;
            const posB = indexB === -1 ? 999 : indexB;
            return posA - posB;
          });

          if (isMounted) {
            setServices(servicesList);
          }
        }, (error) => {
          console.error("Services onSnapshot error:", error);
        });
      } catch (err) {
        console.error("Error initializing services from Firestore:", err);
        // Fallback to static data so the app doesn't break
        if (isMounted) {
          setServices(servicesData);
        }
      }
    }

    initServices();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Subscribe to Locations (Real-Time) with safe seeding
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    async function initLocations() {
      try {
        const locationsRef = collection(db, 'locations');
        const querySnapshot = await getDocs(locationsRef);

        // Seed if empty
        if (querySnapshot.empty) {
          console.log("Firestore locations collection is empty. Seeding initial locations...");
          const seedPromises = locationsData.map((loc) => 
            setDoc(doc(db, 'locations', loc.id), loc)
          );
          await Promise.all(seedPromises);
        }

        if (!isMounted) return;

        // Subscribe to real-time updates
        unsubscribe = onSnapshot(locationsRef, (snapshot) => {
          const locationsList: LocationDivision[] = [];
          snapshot.forEach((doc) => {
            locationsList.push({ id: doc.id, ...doc.data() } as LocationDivision);
          });
          
          if (isMounted) {
            setLocations(locationsList);
          }
        }, (error) => {
          console.error("Locations onSnapshot error:", error);
        });
      } catch (err) {
        console.error("Error initializing locations from Firestore:", err);
        // Fallback to static data
        if (isMounted) {
          setLocations(locationsData);
        }
      }
    }

    initLocations();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 3. Subscribe to Bookings (Real-Time) with localStorage fallback
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    async function initBookings() {
      try {
        const bookingsRef = collection(db, 'bookings');
        
        // Try setting up real-time listener
        unsubscribe = onSnapshot(bookingsRef, (snapshot) => {
          const bookingsList: Booking[] = [];
          snapshot.forEach((doc) => {
            bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
          });

          // Sort by creation date descending
          bookingsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (isMounted) {
            setBookings(bookingsList);
            // Backup to localStorage for extra offline safety
            localStorage.setItem('washup_bookings', JSON.stringify(bookingsList));
            setLoading(false);
          }
        }, (error) => {
          console.error("Bookings onSnapshot error, falling back to localStorage:", error);
          loadLocalBookings();
        });
      } catch (err) {
        console.error("Error setting up bookings Firestore listener:", err);
        loadLocalBookings();
      }
    }

    function loadLocalBookings() {
      if (!isMounted) return;
      const saved = localStorage.getItem('washup_bookings');
      if (saved) {
        try {
          setBookings(JSON.parse(saved));
        } catch {
          setBookings([]);
        }
      }
      setLoading(false);
    }

    initBookings();

    // 4. Subscribe to Customer Orders (Real-Time)
    let unsubscribeOrders: (() => void) | null = null;
    async function initOrders() {
      try {
        const ordersRef = collection(db, 'orders');
        unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
          const ordersList: Order[] = [];
          snapshot.forEach((doc) => {
            ordersList.push({ id: doc.id, ...doc.data() } as Order);
          });
          
          // Sort by creation or order date descending
          ordersList.sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());
          
          if (isMounted) {
            setOrders(ordersList);
          }
        }, (error) => {
          console.error("Orders onSnapshot error:", error);
        });
      } catch (err) {
        console.error("Error setting up orders Firestore listener:", err);
      }
    }
    initOrders();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  // CRUD for Services
  const saveService = async (service: Service) => {
    try {
      const serviceRef = doc(db, 'services', service.id);
      await setDoc(serviceRef, service);
    } catch (err) {
      console.error("Error saving service to Firestore:", err);
      throw err;
    }
  };

  const removeService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      console.error("Error deleting service from Firestore:", err);
      throw err;
    }
  };

  // CRUD for Locations
  const saveLocation = async (location: LocationDivision) => {
    try {
      const locationRef = doc(db, 'locations', location.id);
      await setDoc(locationRef, location);
    } catch (err) {
      console.error("Error saving location to Firestore:", err);
      throw err;
    }
  };

  const removeLocation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (err) {
      console.error("Error deleting location from Firestore:", err);
      throw err;
    }
  };

  // CRUD for Bookings
  const saveBooking = async (booking: Booking) => {
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await setDoc(bookingRef, booking);
    } catch (err) {
      console.error("Error saving booking to Firestore:", err);
      // Fallback to local storage if offline
      setBookings((prev) => {
        const filtered = prev.filter((b) => b.id !== booking.id);
        const updated = [booking, ...filtered];
        localStorage.setItem('washup_bookings', JSON.stringify(updated));
        return updated;
      });
      throw err;
    }
  };

  const removeBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.error("Error deleting booking from Firestore:", err);
      // Fallback
      setBookings((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        localStorage.setItem('washup_bookings', JSON.stringify(updated));
        return updated;
      });
      throw err;
    }
  };

  // CRUD for Custom Customer Orders
  const saveOrder = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(orderRef, order);
    } catch (err) {
      console.error("Error saving order to Firestore:", err);
      throw err;
    }
  };

  const removeOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      console.error("Error deleting order from Firestore:", err);
      throw err;
    }
  };

  // Manual Force Sync all default products/locations if they got deleted or are out of sync
  const forceCloudSync = async () => {
    setSyncStatus('syncing');
    try {
      console.log("Triggering manual force cloud synchronization...");
      
      // Ensure all services in current servicesData exist in Firestore
      for (const s of servicesData) {
        await setDoc(doc(db, 'services', s.id), s);
      }

      // Ensure all locations in current locationsData exist in Firestore
      for (const l of locationsData) {
        await setDoc(doc(db, 'locations', l.id), l);
      }

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err) {
      console.error("Error during force sync:", err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
      throw err;
    }
  };

  return {
    services,
    locations,
    bookings,
    orders,
    loading,
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
  };
}
