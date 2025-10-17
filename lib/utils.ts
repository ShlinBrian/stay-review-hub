/**
 * Utility Functions for Flex Living Reviews Dashboard
 *
 * This file contains helper functions used across the application.
 * Backend Developer: Implement the TODO functions below.
 */

import type {
  HostawayReview,
  HostawayReviewCategory,
  Review,
} from '@/types';

/**
 * Calculate average rating from category ratings
 *
 * Takes an array of category ratings, calculates the average,
 * and returns it rounded to 1 decimal place.
 * Returns null if no categories are provided or all ratings are invalid.
 *
 * @param categories - Array of category rating objects
 * @returns Average rating (0-10 scale) or null
 */
export function calculateAverageRating(
  categories: HostawayReviewCategory[]
): number | null {
  if (!categories || categories.length === 0) return null;

  // Filter out any invalid ratings
  const validRatings = categories
    .map((cat) => cat.rating)
    .filter((rating) => rating !== null && rating !== undefined && !isNaN(rating));

  if (validRatings.length === 0) return null;

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10;
}

/**
 * Map listing name to property ID
 *
 * Creates a consistent property ID from listing name by:
 * - Converting to lowercase
 * - Replacing non-alphanumeric characters with hyphens
 * - Removing duplicate hyphens and trimming
 *
 * This ensures the same listing name always maps to the same property ID.
 *
 * @param listingName - Name of the property from Hostaway
 * @returns Property ID (string)
 */
export function mapListingToPropertyId(listingName: string): string {
  if (!listingName) {
    throw new Error('Listing name is required');
  }

  return listingName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalize Hostaway review to internal format
 *
 * Transforms Hostaway API format to our internal Review type by:
 * - Converting ID to string format
 * - Mapping listing name to property ID
 * - Calculating average rating from categories (if not provided)
 * - Converting date strings to Date objects
 * - Setting default values for internal fields
 *
 * @param raw - Raw review data from Hostaway API
 * @returns Normalized Review object
 */
export function normalizeHostawayReview(raw: HostawayReview): Review {
  // Calculate rating: use provided rating or calculate from categories
  let finalRating: number | null = raw.rating;

  if (finalRating === null || finalRating === undefined) {
    finalRating = calculateAverageRating(raw.reviewCategory);
  }

  // Parse the date - handle both ISO and custom formats
  let submittedDate: Date;
  try {
    // Try parsing the date string
    submittedDate = new Date(raw.submittedAt);

    // Check if the date is valid
    if (isNaN(submittedDate.getTime())) {
      // If invalid, try replacing space with 'T' for ISO format
      submittedDate = new Date(raw.submittedAt.replace(' ', 'T'));
    }

    // If still invalid, use current date as fallback
    if (isNaN(submittedDate.getTime())) {
      console.warn(`Invalid date format for review ${raw.id}: ${raw.submittedAt}`);
      submittedDate = new Date();
    }
  } catch (error) {
    console.warn(`Error parsing date for review ${raw.id}:`, error);
    submittedDate = new Date();
  }

  return {
    id: raw.id.toString(),
    propertyId: mapListingToPropertyId(raw.listingName),
    guestName: raw.guestName || 'Anonymous',
    rating: finalRating,
    publicReview: raw.publicReview || '',
    channel: 'hostaway',
    reviewType: raw.type,
    status: raw.status,
    displayOnWebsite: false,
    categories: raw.reviewCategory || [],
    submittedAt: submittedDate,
  };
}

/**
 * Format date for display
 *
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Aug 21, 2020")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format rating for display
 *
 * @param rating - Rating number (0-10 scale)
 * @returns Formatted rating string (e.g., "9.5")
 */
export function formatRating(rating: number | null): string {
  if (rating === null) return 'N/A';
  return rating.toFixed(1);
}

/**
 * Get rating color class for Tailwind
 *
 * @param rating - Rating number (0-10 scale)
 * @returns Tailwind color class
 */
export function getRatingColorClass(rating: number | null): string {
  if (rating === null) return 'text-gray-500';
  if (rating >= 9) return 'text-green-600';
  if (rating >= 7) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Class name helper for conditional classes
 *
 * @param classes - Object with class names as keys and conditions as values
 * @returns Space-separated class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
