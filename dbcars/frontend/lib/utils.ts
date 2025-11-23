import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get full image URL from a relative path
 * @param url - Image URL (can be relative path like /uploads/vehicles/image.jpg or full URL)
 * @returns Full URL to the image
 */
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get base URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Ensure URL starts with /
  const imagePath = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${imagePath}`;
}

