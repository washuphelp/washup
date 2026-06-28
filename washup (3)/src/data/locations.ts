import { LocationDivision } from '../types';

export const locationsData: LocationDivision[] = [
  {
    id: 'noida',
    name: 'Noida & Greater Noida',
    areas: ['Sector 15', 'Sector 62', 'Sector 137', 'Noida Extension', 'Sector 50', 'Greater Noida Alpha 1', 'Sector 76', 'Sector 93'],
    schedule: 'Daily Pickup (8:00 AM - 9:00 PM)',
    popular: true
  },
  {
    id: 'gurugram',
    name: 'Gurugram (Gurgaon)',
    areas: ['DLF Phase 1-5', 'Sector 56', 'Sohna Road', 'Golf Course Road', 'Sector 45', 'Sushant Lok 1', 'Cyber City', 'Sector 82'],
    schedule: 'Daily Pickup (7:00 AM - 9:00 PM)',
    popular: true
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    areas: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Kaushambi', 'Raj Nagar Extension', 'Crossings Republik'],
    schedule: 'Mon, Wed, Fri, Sat (9:00 AM - 7:00 PM)',
    popular: true
  },
  {
    id: 'new-delhi-ncr',
    name: 'New Delhi NCR',
    areas: ['Connaught Place', 'Saket', 'Vasant Kunj', 'Dwarka', 'Karol Bagh', 'Noida Border', 'Gurugram Border'],
    schedule: 'Daily Pickup (8:00 AM - 9:00 PM)',
    popular: true
  }
];
