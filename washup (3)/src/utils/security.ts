import { getSupabase, LoginHistoryRecord } from '../lib/supabase';

export interface DeviceInfo {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browserName: string;
  browserVersion: string;
  osName: string;
  userAgent: string;
  resolution: string;
}

export interface GeoInfo {
  ip: string;
  country: string;
  state: string;
  city: string;
}

// User-Agent and Screen Resolution parser
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobi|ipod|iphone|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'Mobile';
  }
  
  // OS Detection
  let osName = 'Unknown OS';
  if (/windows/i.test(ua)) osName = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/linux/i.test(ua)) osName = 'Linux';
  
  // Browser Detection
  let browserName = 'Unknown Browser';
  let browserVersion = 'Unknown Version';
  
  const browsers = [
    { name: 'Edge', regex: /edg\/([0-9._]+)/i },
    { name: 'Chrome', regex: /(?:chrome|crios)\/([0-9._]+)/i },
    { name: 'Firefox', regex: /firefox\/([0-9._]+)/i },
    { name: 'Safari', regex: /version\/([0-9._]+).*safari/i },
    { name: 'Opera', regex: /(?:opera|opr)\/([0-9._]+)/i }
  ];
  
  for (const b of browsers) {
    const match = ua.match(b.regex);
    if (match) {
      browserName = b.name;
      browserVersion = match[1].split('.')[0];
      break;
    }
  }
  
  if (/edg/i.test(ua)) {
    browserName = 'Edge';
    const match = ua.match(/edg\/([0-9._]+)/i);
    if (match) browserVersion = match[1].split('.')[0];
  }
  
  const resolution = `${window.screen.width}x${window.screen.height}`;
  
  return {
    deviceType,
    browserName,
    browserVersion,
    osName,
    userAgent: ua,
    resolution
  };
}

// Fetch Public IP & Geolocation
export async function fetchGeoInfo(): Promise<GeoInfo> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('Failed to fetch geo info');
    const data = await res.json();
    return {
      ip: data.ip || 'Unknown IP',
      country: data.country_name || 'Unknown Country',
      state: data.region || 'Unknown State',
      city: data.city || 'Unknown City'
    };
  } catch (error) {
    console.error('Primary IP Geolocation error, trying backup:', error);
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoRes.json();
      return {
        ip: ip,
        country: geoData.country_name || 'Unknown Country',
        state: geoData.region || 'Unknown State',
        city: geoData.city || 'Unknown City'
      };
    } catch (fallbackError) {
      console.error('Fallback Geolocation error:', fallbackError);
      return {
        ip: 'Unknown IP',
        country: 'Unknown Country',
        state: 'Unknown State',
        city: 'Unknown City'
      };
    }
  }
}

// Log a successful or failed login attempt to Supabase
export async function logLoginAttempt(
  username: string,
  status: 'SUCCESS' | 'FAILED'
): Promise<{ record: LoginHistoryRecord | null; isNewDevice: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase not configured. Cannot save login attempt.');
    return { record: null, isNewDevice: false };
  }
  
  const deviceInfo = getDeviceInfo();
  const geoInfo = await fetchGeoInfo();
  
  // Manage Unique Device Identification
  let deviceId = localStorage.getItem('washup_device_id');
  let isNewDevice = false;
  
  if (!deviceId) {
    deviceId = 'dev-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('washup_device_id', deviceId);
    isNewDevice = status === 'SUCCESS';
  } else if (status === 'SUCCESS') {
    // Check if this device has logged in successfully in the database before
    try {
      const { data, error } = await supabase
        .from('admin_login_history')
        .select('id')
        .eq('device_id', deviceId)
        .eq('status', 'SUCCESS')
        .limit(1);
        
      if (!error && (!data || data.length === 0)) {
        isNewDevice = true;
      }
    } catch (err) {
      console.error('Error checking new device status:', err);
    }
  }
  
  // Unique Session ID for current browser session
  let sessionId = sessionStorage.getItem('washup_admin_session_id');
  if (!sessionId) {
    sessionId = 'sess-' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('washup_admin_session_id', sessionId);
  }
  
  const record: LoginHistoryRecord = {
    username,
    status,
    ip_address: geoInfo.ip,
    device_type: deviceInfo.deviceType,
    browser: `${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
    os: deviceInfo.osName,
    user_agent: deviceInfo.userAgent,
    resolution: deviceInfo.resolution,
    country: geoInfo.country,
    state: geoInfo.state,
    city: geoInfo.city,
    is_new_device: isNewDevice,
    session_id: sessionId,
    device_id: deviceId,
    is_logged_out: false
  };
  
  try {
    const { data, error } = await supabase
      .from('admin_login_history')
      .insert([record])
      .select();
      
    if (error) throw error;
    
    return { record: data ? data[0] : null, isNewDevice };
  } catch (error) {
    console.error('Failed to save login history record to Supabase:', error);
    return { record, isNewDevice };
  }
}

// Check if current browser session is still active
export async function checkSessionActive(sessionId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true; // Fail-safe (assume active if not configured)
  
  try {
    const { data, error } = await supabase
      .from('admin_login_history')
      .select('is_logged_out')
      .eq('session_id', sessionId)
      .eq('status', 'SUCCESS')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    if (data && data.length > 0) {
      return !data[0].is_logged_out;
    }
    return true;
  } catch (error) {
    console.error('Failed to check session active status:', error);
    return true;
  }
}
