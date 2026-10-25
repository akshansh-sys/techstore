/**
 * Helper utilities for formatting Currency and Dates for Indian Kirana / Retail shops.
 * Timezone: Asia/Kolkata
 * Currency: Indian Rupee (₹)
 */

// Formats a number to Indian Rupee standard format (e.g. ₹1,250.00)
export function formatRupees(amount) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

// Formats an ISO date string into readable Indian standard time format
export function formatDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

// Checks if a given ISO string belongs to today (Asia/Kolkata timezone)
export function isTodayInIndia(isoString) {
  if (!isoString) return false;
  try {
    const itemDate = new Date(isoString);
    const now = new Date();

    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const itemFormatted = new Intl.DateTimeFormat('en-CA', options).format(itemDate); // YYYY-MM-DD
    const todayFormatted = new Intl.DateTimeFormat('en-CA', options).format(now);

    return itemFormatted === todayFormatted;
  } catch {
    return false;
  }
}
