/**
 * Supabase Client & Authentication Service for TechStore
 * 
 * Supports:
 * 1. Environment variables from .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 2. In-browser configuration saved in localStorage for quick testing
 * 3. Email + Password Sign-In
 * 4. Account Creation with 6-digit OTP Verification
 * 5. Resend OTP code functionality
 */

import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_CONFIG = 'techstore_supabase_config';
const STORAGE_KEY_AUTH_USER = 'techstore_auth_user';
const STORAGE_KEY_PENDING_OTP = 'techstore_pending_otp';

// Get credentials from .env or localStorage
export function getSupabaseCredentials() {
  const localConfig = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (localConfig?.url || envUrl).trim();
  const anonKey = (localConfig?.anonKey || envKey).trim();

  return { url, anonKey };
}

// Check if valid credentials have been provided
export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return (
    Boolean(url) &&
    Boolean(anonKey) &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !anonKey.includes('your-anon-key')
  );
}

// Save credentials in browser storage
export function saveSupabaseCredentials(url, anonKey) {
  try {
    localStorage.setItem(
      STORAGE_KEY_CONFIG,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    // Reload client
    initSupabaseClient();
    return true;
  } catch (err) {
    console.error('Error saving credentials:', err);
    return false;
  }
}

// Clear browser storage credentials
export function clearSupabaseCredentials() {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
  initSupabaseClient();
}

// Single active Supabase client instance
let supabase = null;

export function initSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();

  if (isSupabaseConfigured()) {
    try {
      supabase = createClient(url, anonKey);
      return supabase;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabase = null;
      return null;
    }
  }

  supabase = null;
  return null;
}

// Initial initialization
initSupabaseClient();

export function getSupabase() {
  if (!supabase) {
    initSupabaseClient();
  }
  return supabase;
}

// ==========================================
// AUTHENTICATION & SESSION HELPERS
// ==========================================

export function getLocalUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  }
}

// Sign In with Email & Password
export async function loginWithEmail(email, password) {
  const client = getSupabase();

  if (client && isSupabaseConfigured()) {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;

    const user = data.user;
    setLocalUser({
      id: user.id,
      email: user.email,
      shopName: user.user_metadata?.shop_name || 'TechStore Kirana',
      isSupabase: true,
    });
    return user;
  }

  // Demo Fallback (if Supabase credentials are not configured yet)
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const demoUser = {
    id: `local_${Date.now()}`,
    email: email.trim(),
    shopName: 'TechStore Kirana & General Store',
    isSupabase: false,
  };
  setLocalUser(demoUser);
  return demoUser;
}

/**
 * Step 1: Register User with Email, Password & Shop Name.
 * Supabase triggers a 6-digit confirmation OTP email to the user.
 */
export async function registerWithEmail(email, password, shopName = 'TechStore') {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const client = getSupabase();

  if (client && isSupabaseConfigured()) {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          shop_name: shopName.trim() || 'TechStore',
        },
      },
    });
    if (error) throw error;

    // Save pending registration metadata for OTP step
    sessionStorage.setItem(
      STORAGE_KEY_PENDING_OTP,
      JSON.stringify({
        email: email.trim(),
        shopName: shopName.trim(),
        isSupabase: true,
      })
    );

    return {
      needsOtp: true,
      user: data.user,
      session: data.session,
    };
  }

  // Demo Mode: Generate a 6-digit OTP code for local testing
  const demoCode = '123456';
  sessionStorage.setItem(
    STORAGE_KEY_PENDING_OTP,
    JSON.stringify({
      email: email.trim(),
      shopName: shopName.trim(),
      demoOtp: demoCode,
      isSupabase: false,
    })
  );

  return {
    needsOtp: true,
    demoOtp: demoCode,
    user: { email: email.trim() },
  };
}

/**
 * Step 2: Verify the 6-Digit OTP Code sent to user's email.
 */
export async function verifySignUpOtp(email, otpToken, shopName = 'TechStore') {
  const cleanOtp = otpToken.trim();
  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit OTP code.');
  }

  const client = getSupabase();

  if (client && isSupabaseConfigured()) {
    // Try type 'signup' first
    let { data, error } = await client.auth.verifyOtp({
      email: email.trim(),
      token: cleanOtp,
      type: 'signup',
    });

    // If 'signup' type fails, try 'email' type as fallback
    if (error) {
      const fallback = await client.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: 'email',
      });
      if (fallback.error) {
        throw error;
      }
      data = fallback.data;
    }

    const verifiedUser = data.user;
    if (!verifiedUser) {
      throw new Error('OTP verification did not return an active user.');
    }

    // Set local authenticated session
    setLocalUser({
      id: verifiedUser.id,
      email: verifiedUser.email,
      shopName: verifiedUser.user_metadata?.shop_name || shopName || 'TechStore',
      isSupabase: true,
    });

    sessionStorage.removeItem(STORAGE_KEY_PENDING_OTP);
    return verifiedUser;
  }

  // Demo Mode Verification
  const pendingRaw = sessionStorage.getItem(STORAGE_KEY_PENDING_OTP);
  const pendingData = pendingRaw ? JSON.parse(pendingRaw) : null;
  const expectedOtp = pendingData?.demoOtp || '123456';

  if (cleanOtp !== expectedOtp) {
    throw new Error(`Invalid OTP. In demo mode, please enter ${expectedOtp}.`);
  }

  const demoUser = {
    id: `local_${Date.now()}`,
    email: email.trim(),
    shopName: shopName.trim() || 'TechStore Kirana',
    isSupabase: false,
  };

  setLocalUser(demoUser);
  sessionStorage.removeItem(STORAGE_KEY_PENDING_OTP);
  return demoUser;
}

/**
 * Resend 6-digit OTP to user's email
 */
export async function resendSignUpOtp(email) {
  const client = getSupabase();

  if (client && isSupabaseConfigured()) {
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) throw error;
    return true;
  }

  // Demo Mode Resend
  return true;
}

// Sign Out
export async function logoutUser() {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
  }
  setLocalUser(null);
  sessionStorage.removeItem(STORAGE_KEY_PENDING_OTP);
  return true;
}
