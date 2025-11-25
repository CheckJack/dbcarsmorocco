export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'cookie-consent';

/**
 * Get the current cookie consent preferences from localStorage
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as CookieConsent;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

/**
 * Check if user has given consent (any consent is considered valid)
 */
export function hasConsent(): boolean {
  const consent = getCookieConsent();
  return consent !== null;
}

/**
 * Check if a specific cookie category is consented
 */
export function hasCategoryConsent(category: CookieCategory): boolean {
  const consent = getCookieConsent();
  if (!consent) {
    return false;
  }

  // Necessary cookies are always allowed
  if (category === 'necessary') {
    return true;
  }

  return consent[category] === true;
}

/**
 * Save cookie consent preferences to localStorage
 */
export function setCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentConsent = getCookieConsent();
    const newConsent: CookieConsent = {
      necessary: true, // Always true
      analytics: consent.analytics ?? currentConsent?.analytics ?? false,
      marketing: consent.marketing ?? currentConsent?.marketing ?? false,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  setCookieConsent({
    necessary: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Reject all optional cookies (keep only necessary)
 */
export function rejectAllCookies(): void {
  setCookieConsent({
    necessary: true,
    analytics: false,
    marketing: false,
  });
}

/**
 * Clear cookie consent (for testing or user request)
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
}

