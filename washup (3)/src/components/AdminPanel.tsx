import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Eye, EyeOff, Shield, LogOut, Plus, Trash2, Edit2, Check, X, 
  MapPin, Image as ImageIcon, Sparkles, Footprints, RefreshCw, AlertCircle, 
  DollarSign, FileText, PlusCircle, UploadCloud, Search,
  History, Smartphone, Laptop, Tablet as TabletIcon, Globe, Download, Trash, Key, Server, Database
} from 'lucide-react';
import { Service, LocationDivision, Order } from '../types';
import { jsPDF } from 'jspdf';
import { getSupabase, LoginHistoryRecord } from '../lib/supabase';
import { logLoginAttempt, checkSessionActive } from '../utils/security';

interface AdminPanelProps {
  services: Service[];
  locations: LocationDivision[];
  orders: Order[];
  onSaveService: (service: Service) => Promise<void>;
  onRemoveService: (id: string) => Promise<void>;
  onSaveLocation: (location: LocationDivision) => Promise<void>;
  onRemoveLocation: (id: string) => Promise<void>;
  onSaveOrder?: (order: Order) => Promise<void>;
  onRemoveOrder?: (id: string) => Promise<void>;
  onClose: () => void;
  onForceSync?: () => Promise<void>;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
}

// SHA-256 cryptographically secure comparison
async function hashString(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function AdminPanel({
  services,
  locations,
  orders,
  onSaveService,
  onRemoveService,
  onSaveLocation,
  onRemoveLocation,
  onSaveOrder,
  onRemoveOrder,
  onClose,
  onForceSync,
  syncStatus = 'idle',
}: AdminPanelProps) {
  // Authentication State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('washup_admin_auth') === 'true';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'services' | 'locations' | 'orders' | 'security'>('services');

  // Security Dashboard States
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchIp, setSearchIp] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [filterDevice, setFilterDevice] = useState<'ALL' | 'Desktop' | 'Mobile' | 'Tablet'>('ALL');

  // Order Form & Filter States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');
  const [custOrderDetails, setCustOrderDetails] = useState('');
  const [custAmount, setCustAmount] = useState('');
  const [custDate, setCustDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [searchContact, setSearchContact] = useState('');
  const [typedContact, setTypedContact] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typedStartDate, setTypedStartDate] = useState('');
  const [typedEndDate, setTypedEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Service Form State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceUnit, setServiceUnit] = useState('pair');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'shoe-spa' | 'dry-clean'>('shoe-spa');
  const [serviceImageUrl, setServiceImageUrl] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Location Form State
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locSchedule, setLocSchedule] = useState('Daily Pickup (8:00 AM - 9:00 PM)');
  const [locPopular, setLocPopular] = useState(true);
  const [locAreas, setLocAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');

  // Status message state
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        try {
          await onConfirm();
        } catch (error) {
          console.error("Confirmation action failed:", error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Clear status messages after 3 seconds
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ text: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // Session Active Monitoring (Kicks out remotely terminated sessions)
  useEffect(() => {
    const checkSession = async () => {
      const currentSessionId = sessionStorage.getItem('washup_admin_session_id');
      if (isAuthenticated && currentSessionId) {
        const isActive = await checkSessionActive(currentSessionId);
        if (!isActive) {
          setIsAuthenticated(false);
          sessionStorage.removeItem('washup_admin_auth');
          sessionStorage.removeItem('washup_admin_session_id');
          showStatus('This session was remotely terminated.', 'error');
        }
      }
    };
    
    checkSession();
    const interval = setInterval(checkSession, 12000); // Check every 12s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Load history when entering security tab
  useEffect(() => {
    if (activeTab === 'security' && isAuthenticated) {
      fetchHistory();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch security audit logs
  const fetchHistory = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('admin_login_history')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLoginHistory(data || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Delete an individual audit log
  const handleDeleteHistory = async (id: string) => {
    triggerConfirm(
      'Delete history record?',
      'Are you sure you want to delete this specific audit log? This is irreversible.',
      async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        
        try {
          const { error } = await supabase
            .from('admin_login_history')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          showStatus('Log entry deleted successfully.', 'success');
          fetchHistory();
        } catch (err) {
          console.error(err);
          showStatus('Failed to delete history record.', 'error');
        }
      }
    );
  };

  // Truncate all security audit logs
  const handleClearAllHistory = async () => {
    triggerConfirm(
      'Clear all login history?',
      'Are you sure you want to permanently clear all security audit logs from Supabase?',
      async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        
        try {
          const { error } = await supabase
            .from('admin_login_history')
            .delete()
            .neq('username', 'non_existent_placeholder_to_force_delete_all');
            
          if (error) throw error;
          showStatus('All login history wiped successfully.', 'success');
          fetchHistory();
        } catch (err) {
          console.error(err);
          showStatus('Failed to clear login history.', 'error');
        }
      }
    );
  };

  // Remotely terminate another active session
  const handleRemoteLogout = async (sessId: string) => {
    triggerConfirm(
      'Terminate active session?',
      'Are you sure you want to terminate this active session? The admin on that device will be booted immediately.',
      async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        
        try {
          const { error } = await supabase
            .from('admin_login_history')
            .update({ is_logged_out: true })
            .eq('session_id', sessId);
            
          if (error) throw error;
          showStatus('Remote session terminated successfully!', 'success');
          fetchHistory();
        } catch (err) {
          console.error(err);
          showStatus('Failed to terminate remote session.', 'error');
        }
      }
    );
  };

  // Export logs to CSV
  const exportHistoryToCSV = () => {
    if (loginHistory.length === 0) {
      showStatus('No history records to export.', 'error');
      return;
    }
    
    try {
      const headers = [
        'ID',
        'Date/Time (UTC)',
        'Username',
        'Status',
        'IP Address',
        'Device Type',
        'Browser',
        'OS',
        'User Agent',
        'Resolution',
        'Country',
        'State',
        'City',
        'New Device?',
        'Session Logged Out?'
      ];
      
      const rows = loginHistory.map(r => [
        r.id || '',
        r.created_at || '',
        r.username || '',
        r.status || '',
        r.ip_address || '',
        r.device_type || '',
        r.browser || '',
        r.os || '',
        `"${(r.user_agent || '').replace(/"/g, '""')}"`,
        r.resolution || '',
        r.country || '',
        r.state || '',
        r.city || '',
        r.is_new_device ? 'Yes' : 'No',
        r.is_logged_out ? 'Yes' : 'No'
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Washup_Admin_Login_History_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      showStatus('Audit logs exported to CSV!', 'success');
    } catch (err) {
      console.error(err);
      showStatus('Failed to export CSV.', 'error');
    }
  };

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthError(false);

    // Secure SHA-256 Hashes for credentials:
    // Username: SkyPhoNE09
    // Password: GreaTloVer
    const targetUsernameHash = 'f682edb3bfb2abb8042b2860e3ca74c82007cdc663e65d7e3424f73c919a0647';
    const targetPasswordHash = 'd355aa8b28c5efac545508b635d0d18d629e2a641485168b840979add6188f77';

    const enteredUsernameHash = await hashString(usernameInput);
    const enteredPasswordHash = await hashString(passwordInput);

    if (enteredUsernameHash === targetUsernameHash && enteredPasswordHash === targetPasswordHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem('washup_admin_auth', 'true');
      showStatus('Admin logged in securely!', 'success');
      
      // Log successful login
      await logLoginAttempt(usernameInput, 'SUCCESS');
    } else {
      setIsAuthError(true);
      setPasswordInput('');
      
      // Log failed login
      await logLoginAttempt(usernameInput || 'Unknown', 'FAILED');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('washup_admin_auth');
    sessionStorage.removeItem('washup_admin_session_id');
    showStatus('Logged out successfully', 'success');
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
  };

  // Convert uploaded image file to high-performance Base64 data URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.2 * 1024 * 1024) {
      showStatus('Image size must be smaller than 1.2 MB.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setServiceImageUrl(reader.result as string);
      setIsUploading(false);
      showStatus('Image loaded successfully!', 'success');
    };
    reader.onerror = () => {
      setIsUploading(false);
      showStatus('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Preset Unsplash options for beautiful fallbacks
  const unsplashPresets = [
    { name: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
    { name: 'Formal Shoes', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80' },
    { name: 'Boots', url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80' },
    { name: 'Dry Clean', url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Suit / blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80' },
    { name: 'Ethic Kurtas', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80' },
  ];

  // Feature handling
  const addFeature = () => {
    if (newFeature.trim() && !featuresList.includes(newFeature.trim())) {
      setFeaturesList([...featuresList, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  // Submit Service Save
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice.trim() || !serviceDesc.trim()) {
      showStatus('Please fill in Name, Price, and Description.', 'error');
      return;
    }

    const serviceId = editingServiceId || serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Preset random color light/dark visual theme class for custom newly added items
    const colors = [
      { light: 'from-amber-50 to-orange-50 border-amber-100', dark: 'from-amber-950/20 to-orange-950/20 border-amber-900/30' },
      { light: 'from-blue-50 to-cyan-50 border-blue-100', dark: 'from-blue-950/20 to-cyan-950/20 border-blue-900/30' },
      { light: 'from-rose-50 to-pink-50 border-rose-100', dark: 'from-rose-950/20 to-pink-950/20 border-rose-900/30' },
      { light: 'from-emerald-50 to-teal-50 border-emerald-100', dark: 'from-emerald-950/20 to-teal-950/20 border-emerald-900/30' },
      { light: 'from-violet-50 to-indigo-50 border-violet-100', dark: 'from-violet-950/20 to-indigo-950/20 border-violet-900/30' }
    ];
    const colorPreset = colors[Math.floor(Math.random() * colors.length)];

    const updatedService: Service = {
      id: serviceId,
      name: serviceName.trim(),
      price: servicePrice.trim(),
      unit: serviceUnit,
      description: serviceDesc.trim(),
      bgColorLight: colorPreset.light,
      bgColorDark: colorPreset.dark,
      iconName: serviceCategory === 'shoe-spa' ? 'Footprints' : 'Sparkles',
      features: featuresList.length > 0 ? featuresList : ['Premium chemical detailing', 'Free pickup & door delivery', 'Antibacterial sanitize wash'],
      category: serviceCategory,
      imageUrl: serviceImageUrl || 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=600&q=80',
    };

    try {
      await onSaveService(updatedService);
      showStatus(editingServiceId ? 'Service updated!' : 'New service created!', 'success');
      resetServiceForm();
    } catch (err) {
      showStatus('Failed to save service.', 'error');
    }
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServicePrice('');
    setServiceUnit('pair');
    setServiceDesc('');
    setServiceImageUrl('');
    setFeaturesList([]);
    setNewFeature('');
  };

  const editService = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServicePrice(service.price);
    setServiceUnit(service.unit);
    setServiceDesc(service.description);
    setServiceCategory(service.category || 'shoe-spa');
    setServiceImageUrl(service.imageUrl || '');
    setFeaturesList(service.features || []);
  };

  const deleteService = async (id: string) => {
    triggerConfirm(
      'Delete Service permanently?',
      'Are you sure you want to delete this service permanently? This action cannot be undone.',
      async () => {
        try {
          await onRemoveService(id);
          showStatus('Service removed successfully.', 'success');
          if (editingServiceId === id) {
            resetServiceForm();
          }
        } catch (err) {
          showStatus('Failed to delete service.', 'error');
        }
      }
    );
  };

  // Location Division Handling
  const addArea = () => {
    if (newArea.trim() && !locAreas.includes(newArea.trim())) {
      setLocAreas([...locAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (areaName: string) => {
    setLocAreas(locAreas.filter(a => a !== areaName));
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) {
      showStatus('Please enter Location Name.', 'error');
      return;
    }

    const locId = editingLocationId || locName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedLoc: LocationDivision = {
      id: locId,
      name: locName.trim(),
      areas: locAreas.length > 0 ? locAreas : ['Sector 1', 'Main Market', 'Central Colony'],
      schedule: locSchedule.trim(),
      popular: locPopular
    };

    try {
      await onSaveLocation(updatedLoc);
      showStatus(editingLocationId ? 'Location updated!' : 'New Location created!', 'success');
      resetLocationForm();
    } catch (err) {
      showStatus('Failed to save location.', 'error');
    }
  };

  const resetLocationForm = () => {
    setEditingLocationId(null);
    setLocName('');
    setLocSchedule('Daily Pickup (8:00 AM - 9:00 PM)');
    setLocPopular(true);
    setLocAreas([]);
    setNewArea('');
  };

  const editLocation = (loc: LocationDivision) => {
    setEditingLocationId(loc.id);
    setLocName(loc.name);
    setLocSchedule(loc.schedule);
    setLocPopular(loc.popular);
    setLocAreas(loc.areas || []);
  };

  const deleteLocation = async (id: string) => {
    triggerConfirm(
      'Delete Location?',
      'Are you sure you want to delete this location?',
      async () => {
        try {
          await onRemoveLocation(id);
          showStatus('Location removed successfully.', 'success');
          if (editingLocationId === id) {
            resetLocationForm();
          }
        } catch (err) {
          showStatus('Failed to delete location.', 'error');
        }
      }
    );
  };

  // --- CUSTOMER ORDERS HANDLERS ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custContact.trim() || !custOrderDetails.trim() || !custAmount.trim() || !custDate.trim()) {
      showStatus('कृपया सभी फ़ील्ड्स भरें (Please fill all fields).', 'error');
      return;
    }

    const orderId = editingOrderId || 'ord-' + Math.random().toString(36).substr(2, 9);
    const updatedOrder: Order = {
      id: orderId,
      customerName: custName.trim(),
      contactNumber: custContact.trim().replace(/\s+/g, ''), // clean whitespace
      orderDetails: custOrderDetails.trim(),
      paymentAmount: parseFloat(custAmount) || 0,
      orderDate: custDate,
      createdAt: editingOrderId ? (orders.find(o => o.id === editingOrderId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    try {
      if (onSaveOrder) {
        await onSaveOrder(updatedOrder);
        showStatus(editingOrderId ? 'ऑर्डर सफलतापूर्वक अपडेट हो गया!' : 'नया ऑर्डर सफलतापूर्वक दर्ज हो गया!', 'success');
        resetOrderForm();
        setIsOrderModalOpen(false);
      } else {
        showStatus('डेटाबेस सिंक उपलब्ध नहीं है।', 'error');
      }
    } catch (err) {
      showStatus('ऑर्डर सहेजने में विफल।', 'error');
    }
  };

  const resetOrderForm = () => {
    setEditingOrderId(null);
    setCustName('');
    setCustContact('');
    setCustOrderDetails('');
    setCustAmount('');
    setCustDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setCustName(order.customerName);
    setCustContact(order.contactNumber);
    setCustOrderDetails(order.orderDetails);
    setCustAmount(order.paymentAmount.toString());
    setCustDate(order.orderDate);
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    triggerConfirm(
      'ऑर्डर हटाएं (Delete Order)?',
      'क्या आप वाकई इस ऑर्डर को हटाना चाहते हैं? यह प्रक्रिया वापस नहीं ली जा सकती।',
      async () => {
        try {
          if (onRemoveOrder) {
            await onRemoveOrder(id);
            showStatus('ऑर्डर सफलतापूर्वक हटा दिया गया है!', 'success');
          }
        } catch (err) {
          showStatus('ऑर्डर हटाने में विफलता।', 'error');
        }
      }
    );
  };

  const handleApplySearchFilters = () => {
    setSearchContact(typedContact.trim());
    setStartDate(typedStartDate);
    setEndDate(typedEndDate);
    setCurrentPage(1);
  };

  const handleClearSearchFilters = () => {
    setSearchContact('');
    setTypedContact('');
    setStartDate('');
    setEndDate('');
    setTypedStartDate('');
    setTypedEndDate('');
    setCurrentPage(1);
  };

  const exportOrdersToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(6, 182, 212); // cyan-500
      doc.text('Washup - Orders Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
      
      if (startDate || endDate) {
        doc.text(`Date Range: ${startDate || 'All'} to ${endDate || 'All'}`, 14, 32);
      }
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, 36, 196, 36);
      
      let y = 45;
      
      // Table Headers
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, y - 5, 182, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text('Date', 15, y);
      doc.text('Customer', 40, y);
      doc.text('Contact', 85, y);
      doc.text('Order Details', 120, y);
      doc.text('Amount', 175, y);
      
      doc.line(14, y + 2, 196, y + 2);
      y += 10;
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      
      // Filter list of orders
      const filtered = orders.filter(o => {
        if (searchContact && !o.contactNumber.includes(searchContact.trim())) return false;
        if (startDate && o.orderDate < startDate) return false;
        if (endDate && o.orderDate > endDate) return false;
        return true;
      });

      filtered.forEach((order) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
          doc.setFont('Helvetica', 'bold');
          doc.text('Date', 15, y);
          doc.text('Customer', 40, y);
          doc.text('Contact', 85, y);
          doc.text('Order Details', 120, y);
          doc.text('Amount', 175, y);
          doc.line(14, y + 2, 196, y + 2);
          y += 10;
          doc.setFont('Helvetica', 'normal');
        }
        
        doc.text(order.orderDate, 15, y);
        
        const nameText = order.customerName.length > 22 ? order.customerName.substring(0, 20) + '..' : order.customerName;
        doc.text(nameText, 40, y);
        doc.text(order.contactNumber, 85, y);
        
        const detailsText = order.orderDetails.length > 28 ? order.orderDetails.substring(0, 26) + '..' : order.orderDetails;
        doc.text(detailsText, 120, y);
        
        doc.text(`Rs. ${order.paymentAmount}`, 175, y);
        
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.line(14, y + 2, 196, y + 2);
        
        y += 8;
      });
      
      // Total amount
      const totalAmount = filtered.reduce((sum, o) => sum + o.paymentAmount, 0);
      y += 5;
      doc.setFont('Helvetica', 'bold');
      doc.text(`Total Filtered Orders: ${filtered.length}`, 15, y);
      doc.text(`Total Amount: Rs. ${totalAmount}`, 145, y);
      
      doc.save(`Washup_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showStatus('PDF रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!', 'success');
    } catch (err) {
      console.error(err);
      showStatus('PDF निर्यात विफल रहा।', 'error');
    }
  };

  // --- RENDERING ADMIN LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              Washup Security Area
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Please enter your authorized administrator credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {isAuthError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Incorrect credentials! Access denied. Hackers are automatically monitored.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Username ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-cyan-400/20 mt-8"
            >
              <Shield className="w-4 h-4" />
              Unlock Panel
            </button>
          </form>

          {/* Secure watermark */}
          <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
            SECURE ACCESS PORTAL • SSL ENCRYPTED
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING AUTHENTICATED PANEL VIEW ---
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Status Message Notification Toast */}
        {statusMsg.text && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-xl border font-bold text-xs flex items-center gap-2 z-50 animate-in slide-in-from-top duration-300 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500 border-emerald-400 text-white' 
              : 'bg-rose-500 border-rose-400 text-white'
          }`}>
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Panel Header */}
        <div className="px-6 py-4.5 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 dark:text-white leading-none">
                Washup Admin Hub
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to Cloud Firestore (Real-Time Live)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onForceSync && (
              <button
                onClick={async () => {
                  try {
                    await onForceSync();
                    showStatus('सभी बदलाव और प्रोडक्ट्स लाइव डेटाबेस में 100% सिंक हो गए हैं!', 'success');
                  } catch (err) {
                    showStatus('सिंक करने में विफल! कृपया इंटरनेट कनेक्शन जांचें।', 'error');
                  }
                }}
                disabled={syncStatus === 'syncing'}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.97] ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-500 text-white cursor-not-allowed border border-amber-500/20'
                    : syncStatus === 'success'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 border border-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/10 border border-cyan-400/20'
                }`}
                title="Publish changes to live database"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : syncStatus === 'success' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Uploaded!</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-850 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all ${
              activeTab === 'services'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Footprints className="w-4 h-4" />
            Manage Services ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all ${
              activeTab === 'locations'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Manage Locations ({locations.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security Dashboard
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          
          {/* TAB 1: SERVICES PANEL */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Side - Column (5 spans) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200">
                    {editingServiceId ? '⚡ Edit Existing Service' : '✨ Add New Service'}
                  </h3>
                  {editingServiceId && (
                    <button 
                      onClick={resetServiceForm}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  {/* Service Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Service Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Leather Shoe Spa, Silk Saree Dry Clean"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      required
                    />
                  </div>

                  {/* Pricing and Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Price (INR ₹) *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <DollarSign className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="number"
                          placeholder="299"
                          value={servicePrice}
                          onChange={(e) => setServicePrice(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Charged per</label>
                      <select
                        value={serviceUnit}
                        onChange={(e) => setServiceUnit(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      >
                        <option value="pair">pair (Shoes)</option>
                        <option value="pc">piece (Cloth)</option>
                        <option value="kg">kilogram (Laundry)</option>
                        <option value="set">set</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceCategory('shoe-spa')}
                        className={`py-2 rounded-xl border text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                          serviceCategory === 'shoe-spa'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <Footprints className="w-4.5 h-4.5" />
                        👟 Shoe Spa
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceCategory('dry-clean')}
                        className={`py-2 rounded-xl border text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                          serviceCategory === 'dry-clean'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles className="w-4.5 h-4.5" />
                        ✨ Dry Clean
                      </button>
                    </div>
                  </div>

                  {/* Service Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Description *</label>
                    <textarea
                      placeholder="Give a short detail about this premium care cycle..."
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      required
                    />
                  </div>

                  {/* Image input and Base64 upload */}
                  <div className="space-y-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Product Photo (Image)</label>
                    
                    {/* File Upload Selector */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 text-center transition-all bg-white dark:bg-slate-900">
                        <ImageIcon className="w-4 h-4 text-cyan-500" />
                        <span>{isUploading ? 'Encoding file...' : 'Choose Photo File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {/* Image URL input (Manual url option) */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <span className="text-[10px] font-bold">URL</span>
                      </span>
                      <input
                        type="text"
                        placeholder="Or paste external image web URL..."
                        value={serviceImageUrl}
                        onChange={(e) => setServiceImageUrl(e.target.value)}
                        className="w-full pl-11 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      />
                    </div>

                    {/* Unsplash Presets buttons */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Aesthetic Unsplash Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {unsplashPresets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setServiceImageUrl(preset.url)}
                            className="text-[9px] px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-md font-bold text-slate-600 dark:text-slate-350"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image preview */}
                    {serviceImageUrl && (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 mt-2">
                        <img 
                          src={serviceImageUrl} 
                          alt="Uploaded service thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setServiceImageUrl('')}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-950/70 text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bullet features manager */}
                  <div className="space-y-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Bullet Features (Service Features)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. UV deodorizer, Stain dry washing"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white font-extrabold text-xs transition-all"
                      >
                        Add
                      </button>
                    </div>

                    {/* Features list tags */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {featuresList.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <span className="truncate">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-rose-500 hover:text-rose-700 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {featuresList.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic block">No custom features added. Defauts will be used.</span>
                      )}
                    </div>
                  </div>

                  {/* Save button CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md mt-6"
                  >
                    <Check className="w-4 h-4" />
                    {editingServiceId ? 'Save Service Updates' : 'Publish Product to Site'}
                  </button>
                </form>
              </div>

              {/* List View Side - Column (7 spans) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200">
                    Live Product Catalog
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    {services.length} items on server
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                  {services.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl flex items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-center gap-3 truncate">
                        {/* Thumbnail image */}
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden">
                          <img 
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=100&q=80'} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <span className="text-[9px] font-extrabold uppercase bg-slate-200/50 dark:bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-400 tracking-wider">
                            {item.category === 'shoe-spa' ? '👟 Shoe' : '✨ Dryclean'}
                          </span>
                          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-0.5">{item.name}</h4>
                          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-extrabold block">₹{item.price}/{item.unit}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => editService(item)}
                          className="p-1.5 bg-slate-100 hover:bg-cyan-500 text-slate-500 hover:text-white dark:bg-slate-900 dark:hover:bg-cyan-600 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(item.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white dark:bg-slate-900 dark:hover:bg-rose-600 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {services.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                      <Footprints className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-3 animate-bounce" />
                      <p className="text-xs font-bold">No active services in database.</p>
                      <p className="text-[10px]">Add some above to populate catalog.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATIONS PANEL */}
          {activeTab === 'locations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Column - Locations */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200">
                    {editingLocationId ? '⚡ Edit Coverage Division' : '✨ Add Coverage Division'}
                  </h3>
                  {editingLocationId && (
                    <button 
                      onClick={resetLocationForm}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleLocationSubmit} className="space-y-4">
                  {/* Location Division Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">City / Division Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ghaziabad, New Delhi South"
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      required
                    />
                  </div>

                  {/* Schedule */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Operating Schedule *</label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Pickup (7:00 AM - 9:00 PM)"
                      value={locSchedule}
                      onChange={(e) => setLocSchedule(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm transition-all"
                      required
                    />
                  </div>

                  {/* Popular check */}
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="popular_chk"
                      checked={locPopular}
                      onChange={(e) => setLocPopular(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="popular_chk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer selection:bg-transparent">
                      Show active status badge on card
                    </label>
                  </div>

                  {/* Areas list tags manager */}
                  <div className="space-y-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Sectors / Operating Areas *</label>
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">Add all the distinct areas, colonies, or sectors you serve in this division.</p>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Sector 15, Dwarka, DLF Phase 3"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={addArea}
                        className="px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white font-extrabold text-xs transition-all"
                      >
                        Add Area
                      </button>
                    </div>

                    {/* Sectors layout list */}
                    <div className="flex flex-wrap gap-1.5 mt-3 max-h-48 overflow-y-auto pr-1">
                      {locAreas.map((area, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-cyan-500/10 dark:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10 rounded-lg"
                        >
                          <span>{area}</span>
                          <button
                            type="button"
                            onClick={() => removeArea(area)}
                            className="text-rose-500 hover:text-rose-700 font-black ml-0.5 text-xs focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {locAreas.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic block mt-1">Please add at least one sector.</span>
                      )}
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md mt-6"
                  >
                    <Check className="w-4 h-4" />
                    {editingLocationId ? 'Save Location Updates' : 'Add Location Network'}
                  </button>
                </form>
              </div>

              {/* Location display grid (7 spans) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200">
                    Active Coverage Areas
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    {locations.length} Divisions
                  </span>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {locations.map((loc) => (
                    <div 
                      key={loc.id}
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-cyan-500" />
                            {loc.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{loc.schedule}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => editLocation(loc)}
                            className="p-1.5 bg-white hover:bg-cyan-500 text-slate-500 hover:text-white dark:bg-slate-900 dark:hover:bg-cyan-600 border border-slate-200/55 dark:border-slate-850 rounded-lg transition-colors"
                            title="Edit Location"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLocation(loc.id)}
                            className="p-1.5 bg-white hover:bg-rose-500 text-slate-500 hover:text-white dark:bg-slate-900 dark:hover:bg-rose-600 border border-slate-200/55 dark:border-slate-850 rounded-lg transition-colors"
                            title="Delete Location"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Sectors badges list */}
                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-850">
                        <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 block mb-1.5">Covered Sectors:</span>
                        <div className="flex flex-wrap gap-1">
                          {loc.areas.map((area, idx) => (
                            <span 
                              key={idx} 
                              className="text-[9px] font-semibold px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {locations.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                      <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-3 animate-bounce" />
                      <p className="text-xs font-bold">No active location divisions.</p>
                      <p className="text-[10px]">Create some above to specify where you service.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS PANEL */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Header card with quick actions */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    ग्राहक ऑर्डर प्रबंधन (Customer Orders)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    दर्ज किए गए सभी ऑर्डर्स का रियल-टाइम रिकॉर्ड। यह डेटा क्लाउड डेटाबेस पर सिंक है।
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    resetOrderForm();
                    setIsOrderModalOpen(true);
                  }}
                  className="w-full md:w-auto px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/15 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  नया ऑर्डर दर्ज करें (New Order)
                </button>
              </div>

              {/* Filters & Export Panel (Unified Premium Layout) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                  {/* Search Input with Contact field (5 columns) */}
                  <div className="xl:col-span-5 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      कस्टमर कॉन्टैक्ट नंबर (Customer Contact Number)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="जैसे: 9876543210 (Type & Click Search)"
                        value={typedContact}
                        onChange={(e) => setTypedContact(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleApplySearchFilters();
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs animate-none"
                      />
                    </div>
                  </div>

                  {/* Date Range selectors (Start and End Dates) side-by-side in a professional row (5 columns) */}
                  <div className="xl:col-span-5 grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        प्रारंभिक तारीख (Start)
                      </label>
                      <input
                        type="date"
                        value={typedStartDate}
                        onChange={(e) => setTypedStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        अंतिम तारीख (End)
                      </label>
                      <input
                        type="date"
                        value={typedEndDate}
                        onChange={(e) => setTypedEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons (2 columns) */}
                  <div className="xl:col-span-2 flex gap-2">
                    <button
                      onClick={handleApplySearchFilters}
                      className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/15 transition-all text-center"
                      title="फ़िल्टर लागू करें (Apply Filters)"
                    >
                      <Search className="w-3.5 h-3.5" />
                      खोजें (Search)
                    </button>
                    
                    <button
                      onClick={handleClearSearchFilters}
                      className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors text-center"
                      title="Clear All Filters"
                    >
                      Clear
                    </button>
                    
                    <button
                      onClick={exportOrdersToPDF}
                      className="px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 active:scale-95 transition-all text-center"
                      title="Export filtered reports as PDF document"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Subtitle badge indicator for active search queries */}
                {(searchContact || startDate || endDate) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">सक्रिय फ़िल्टर:</span>
                    {searchContact && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black border border-cyan-500/20">
                        संपर्क: {searchContact}
                        <button 
                          onClick={() => { setSearchContact(''); setTypedContact(''); }} 
                          className="hover:text-cyan-800 dark:hover:text-cyan-200 ml-1 font-black text-xs"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(startDate || endDate) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black border border-cyan-500/20">
                        तारीख सीमा: {startDate || 'All'} - {endDate || 'All'}
                        <button 
                          onClick={() => { setStartDate(''); setEndDate(''); setTypedStartDate(''); setTypedEndDate(''); }} 
                          className="hover:text-cyan-800 dark:hover:text-cyan-200 ml-1 font-black text-xs"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Orders Data list */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">तारीख (Date)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">कस्टमर (Customer)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">संपर्क (Contact)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">ऑर्डर विवरण (Order Details)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">राशि (Amount)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">कार्रवाई (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                      {(() => {
                        const filtered = orders.filter(o => {
                          if (searchContact && !o.contactNumber.includes(searchContact.trim())) return false;
                          if (startDate && o.orderDate < startDate) return false;
                          if (endDate && o.orderDate > endDate) return false;
                          return true;
                        });

                        const itemsPerPage = 30;
                        const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                        if (paginated.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-slate-400">
                                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-3 animate-pulse" />
                                <p className="text-xs font-bold">कोई ऑर्डर नहीं मिला।</p>
                                <p className="text-[10px]">ऊपर दिए गए बटन से नया ऑर्डर दर्ज कर सकते हैं।</p>
                              </td>
                            </tr>
                          );
                        }

                        return paginated.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{order.orderDate}</td>
                            <td className="p-4 text-xs font-black text-slate-900 dark:text-white">{order.customerName}</td>
                            <td className="p-4 text-xs font-mono font-bold text-slate-600 dark:text-slate-350">{order.contactNumber}</td>
                            <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-450 max-w-xs truncate" title={order.orderDetails}>
                              {order.orderDetails}
                            </td>
                            <td className="p-4 text-xs font-black text-cyan-600 dark:text-cyan-400 text-right">₹{order.paymentAmount}</td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditOrder(order)}
                                  className="p-1.5 bg-slate-50 hover:bg-cyan-500 hover:text-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-rose-500 hover:text-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Adaptive Cards */}
                <div className="block md:hidden divide-y divide-slate-150 dark:divide-slate-850">
                  {(() => {
                    const filtered = orders.filter(o => {
                      if (searchContact && !o.contactNumber.includes(searchContact.trim())) return false;
                      if (startDate && o.orderDate < startDate) return false;
                      if (endDate && o.orderDate > endDate) return false;
                      return true;
                    });

                    const itemsPerPage = 30;
                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                    if (paginated.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400">
                          <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-800 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs font-bold">कोई ऑर्डर नहीं मिला।</p>
                        </div>
                      );
                    }

                    return paginated.map((order) => (
                      <div key={order.id} className="p-4 space-y-2 bg-slate-50/20 dark:bg-slate-950/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">{order.orderDate}</span>
                          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">₹{order.paymentAmount}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{order.customerName}</h4>
                          <p className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">{order.contactNumber}</p>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900">
                          {order.orderDetails}
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="px-2.5 py-1.5 bg-white hover:bg-cyan-500 hover:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1.5 bg-white hover:bg-rose-500 hover:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Pagination control footer bar */}
              {(() => {
                const filtered = orders.filter(o => {
                  if (searchContact && !o.contactNumber.includes(searchContact.trim())) return false;
                  if (startDate && o.orderDate < startDate) return false;
                  if (endDate && o.orderDate > endDate) return false;
                  return true;
                });

                const itemsPerPage = 30;
                const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

                if (totalPages <= 1) return null;

                return (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400">
                      Page {currentPage} of {totalPages} (Total {filtered.length} Orders)
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all dark:text-white"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                            currentPage === p
                              ? 'bg-cyan-500 text-white shadow-xs'
                              : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 dark:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all dark:text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Database Status Alert Banner */}
              {!getSupabase() ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex flex-col sm:flex-row sm:items-center gap-3">
                  <Database className="w-5 h-5 shrink-0 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-extrabold text-sm mb-1">Supabase DB Configuration Needed</p>
                    <p className="opacity-90 font-medium">To permanently persist login history, detect malicious logins, and remotely terminate active sessions, please define your <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> secrets in your environment configuration.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Supabase Secure Connection Active. Row Level Security (RLS) is enabled and protection is live.</span>
                </div>
              )}

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Last Successful Login */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Last Login Info</span>
                  {(() => {
                    const lastSuccess = loginHistory.find(h => h.status === 'SUCCESS');
                    if (!lastSuccess) {
                      return <p className="text-xs font-semibold text-slate-500">No login records recorded yet.</p>;
                    }
                    return (
                      <div className="space-y-1">
                        <p className="font-black text-sm text-slate-800 dark:text-white truncate">{lastSuccess.city || 'Unknown City'}, {lastSuccess.country || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate font-mono">IP: {lastSuccess.ip_address}</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">{new Date(lastSuccess.created_at || '').toLocaleString()}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Success Logs */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Success Logins</span>
                    <span className="text-3xl font-black font-display text-slate-900 dark:text-white">
                      {loginHistory.filter(h => h.status === 'SUCCESS').length}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Failed Attempts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Failed Attempts</span>
                    <span className="text-3xl font-black font-display text-slate-900 dark:text-white">
                      {loginHistory.filter(h => h.status === 'FAILED').length}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* 4. Active Sessions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Active Sessions</span>
                    <span className="text-3xl font-black font-display text-slate-900 dark:text-white">
                      {loginHistory.filter(h => h.status === 'SUCCESS' && !h.is_logged_out).length}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
                    <History className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Active Sessions Remote Terminate Board */}
              {getSupabase() && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <History className="w-4.5 h-4.5 text-cyan-500" />
                      Active Administrator Sessions
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Real-Time Protection</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loginHistory.filter(h => h.status === 'SUCCESS' && !h.is_logged_out).length === 0 ? (
                      <p className="text-xs font-semibold text-slate-400 col-span-2 text-center py-4">No active sessions tracked.</p>
                    ) : (
                      loginHistory.filter(h => h.status === 'SUCCESS' && !h.is_logged_out).map((session) => {
                        const isCurrent = session.session_id === sessionStorage.getItem('washup_admin_session_id');
                        return (
                          <div key={session.id || session.session_id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                            isCurrent 
                              ? 'bg-cyan-50/20 border-cyan-500/30 dark:bg-cyan-950/5' 
                              : 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-200 dark:border-slate-800/80'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-wide font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 flex items-center gap-1">
                                  {session.device_type === 'Desktop' ? <Laptop className="w-3.5 h-3.5" /> : session.device_type === 'Tablet' ? <TabletIcon className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                                  {session.os} ({session.browser})
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-white shadow-xs">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-black text-slate-800 dark:text-white mt-1.5 flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                {session.city || 'Unknown City'}, {session.state || 'Unknown State'}, {session.country || 'Unknown Country'}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                                IP: {session.ip_address} • Screen: {session.resolution || 'Unknown'}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium pt-0.5">
                                Logged in: {new Date(session.created_at || '').toLocaleString()}
                              </p>
                            </div>

                            {!isCurrent && (
                              <button
                                onClick={() => handleRemoteLogout(session.session_id)}
                                className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all border border-rose-500/20"
                              >
                                Terminate Session
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Login Logs Filter and Action Header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Security Audit Logs ({loginHistory.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportHistoryToCSV}
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all bg-white dark:bg-slate-900 dark:text-white"
                      title="Export all login logs to CSV"
                    >
                      <Download className="w-4 h-4 text-cyan-500" />
                      Export CSV
                    </button>

                    {getSupabase() && (
                      <button
                        onClick={handleClearAllHistory}
                        className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Delete all login audit records permanently"
                      >
                        <Trash className="w-4 h-4" />
                        Clear Audit logs
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters Input Area */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                  {/* Filter IP */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Search IP Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 154.21.32.1..."
                        value={searchIp}
                        onChange={(e) => setSearchIp(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs font-semibold transition-all"
                      />
                    </div>
                  </div>

                  {/* Filter Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Filter Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs font-semibold transition-all"
                    >
                      <option value="ALL">All Attempts</option>
                      <option value="SUCCESS">Success Only</option>
                      <option value="FAILED">Failed Only</option>
                    </select>
                  </div>

                  {/* Filter Device */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Filter Device Type</label>
                    <select
                      value={filterDevice}
                      onChange={(e) => setFilterDevice(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs font-semibold transition-all"
                    >
                      <option value="ALL">All Device Types</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Tablet">Tablet</option>
                    </select>
                  </div>
                </div>

                {/* Audit logs table list container */}
                {isLoadingHistory ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">Loading security logs from Supabase...</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="p-3">Status</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">IP Address</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Device / OS</th>
                            <th className="p-3">Browser</th>
                            <th className="p-3">Resolution</th>
                            {getSupabase() && <th className="p-3 text-center">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                          {(() => {
                            const filteredLogs = loginHistory.filter(h => {
                              if (searchIp && !(h.ip_address || '').includes(searchIp.trim())) return false;
                              if (filterStatus !== 'ALL' && h.status !== filterStatus) return false;
                              if (filterDevice !== 'ALL' && h.device_type !== filterDevice) return false;
                              return true;
                            });

                            if (filteredLogs.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                                    No security logs found matching the filters.
                                  </td>
                                </tr>
                              );
                            }

                            return filteredLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 font-medium">
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                                      log.status === 'SUCCESS' 
                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                        : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                      {log.status}
                                    </span>
                                    {log.is_new_device && log.status === 'SUCCESS' && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-black text-[9px] uppercase tracking-wider">
                                        New Device
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-slate-500 font-mono text-[10px]">
                                  {new Date(log.created_at || '').toLocaleString()}
                                </td>
                                <td className="p-3 text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                                  {log.ip_address}
                                </td>
                                <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">
                                  {log.city || 'Unknown'}, {log.state ? `${log.state}, ` : ''}{log.country || 'Unknown'}
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-450">
                                  <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                                    {log.device_type === 'Desktop' ? <Laptop className="w-3.5 h-3.5" /> : log.device_type === 'Tablet' ? <TabletIcon className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                                    {log.os}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-550 dark:text-slate-400">
                                  {log.browser}
                                </td>
                                <td className="p-3 text-slate-400 font-mono text-[10px]">
                                  {log.resolution || 'Unknown'}
                                </td>
                                {getSupabase() && (
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteHistory(log.id!)}
                                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                      title="Delete record from history"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Secure watermark bottom bar */}
        <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-widest text-center uppercase shrink-0">
          WASHUP ENTERPRISE SECURITY SYSTEM • ACTIVE SESSION PROTECTION
        </div>

      </div>

      {/* 5. CUSTOMER ORDER POPUP MODAL (REAL-TIME CLOUD INPUT) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative my-8 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title block */}
            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingOrderId ? '⚡ अपडेट ग्राहक विवरण (Update Order)' : '✨ नया ग्राहक विवरण दर्ज करें (New Customer)'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  सभी विवरण क्लाउड डेटाबेस पर रियल-टाइम सिंक होंगे।
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ग्राहक का नाम (Customer Name) *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">कॉन्टैक्ट नंबर (Contact Number) *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 (बिना स्पेस के)"
                  value={custContact}
                  onChange={(e) => setCustContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Order Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ऑर्डर विवरण (Order Details) *</label>
                <textarea
                  placeholder="e.g. 2 Pairs Sneakers Washup + 1 Jacket Dryclean"
                  value={custOrderDetails}
                  onChange={(e) => setCustOrderDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Payment Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">भुगतान राशि (Amount in ₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 599"
                    value={custAmount}
                    onChange={(e) => setCustAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">तारीख (Date) *</label>
                  <input
                    type="date"
                    value={custDate}
                    onChange={(e) => setCustDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 dark:text-slate-300 text-slate-600 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/15 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  दर्ज करें (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CUSTOM IFRAME-SAFE CONFIRMATION DIALOG MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            {/* Header Block */}
            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                <AlertCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  {confirmDialog.title}
                </h3>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mb-6">
              {confirmDialog.message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 dark:text-slate-300 text-slate-600 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-rose-500/15 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
