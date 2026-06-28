export interface Service {
  id: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  bgColorLight: string; // Background color for light mode (matched to service)
  bgColorDark: string;  // Background color for dark mode (matched to service)
  iconName: string;     // Lucide icon key
  features: string[];
  category?: 'shoe-spa' | 'dry-clean';
  imageUrl?: string;
}

export interface LocationDivision {
  id: string;
  name: string;
  areas: string[];
  schedule: string;
  popular: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  pickupDate: string;
  timeSlot: string;
  address: string;
  landmark?: string;
  weightEstimate: string;
  deliveryType: 'standard' | 'express';
  status: 'pending' | 'confirmed' | 'picked_up' | 'processing' | 'delivered';
  createdAt: string;
  totalCostEstimated: number;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl: string;
  date: string;
}

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  orderDetails: string;
  paymentAmount: number;
  orderDate: string;
  createdAt: string;
}
