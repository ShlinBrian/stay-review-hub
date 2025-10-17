/**
 * Mock Data Utilities
 *
 * Provides functions to load and normalize mock review data
 * for use when database or API is unavailable.
 */

import type { HostawayReview, Review, PropertyPerformance } from '@/types';
import { normalizeHostawayReview } from './utils';

/**
 * Load mock reviews from JSON file and normalize them
 *
 * @returns Promise resolving to array of normalized Review objects
 */
export async function loadMockReviewsNormalized(): Promise<Review[]> {
  try {
    const mockData = await import('@/lib/mock-reviews.json');

    if (mockData.status === 'success' && Array.isArray(mockData.result)) {
      console.log(`Loaded ${mockData.result.length} reviews from mock data`);

      // Normalize all reviews
      const normalized = mockData.result.map((rawReview: any) => {
        try {
          return normalizeHostawayReview(rawReview);
        } catch (error) {
          console.error(`Error normalizing mock review ${rawReview.id}:`, error);
          // Return a fallback review
          return {
            id: rawReview.id.toString(),
            propertyId: 'unknown',
            guestName: rawReview.guestName || 'Anonymous',
            rating: rawReview.rating,
            publicReview: rawReview.publicReview || '',
            channel: 'hostaway',
            reviewType: rawReview.type,
            status: rawReview.status,
            displayOnWebsite: false,
            categories: rawReview.reviewCategory || [],
            submittedAt: new Date(),
          };
        }
      });

      console.log(`Successfully normalized ${normalized.length} mock reviews`);
      return normalized;
    }

    console.error('Invalid mock data format');
    return [];
  } catch (error) {
    console.error('Error loading mock reviews:', error);
    return [];
  }
}

/**
 * Calculate property performance metrics from reviews
 *
 * @param reviews - Array of Review objects
 * @returns Array of PropertyPerformance objects
 */
export function calculatePropertyPerformance(reviews: Review[]): PropertyPerformance[] {
  // Group reviews by property
  const reviewsByProperty = new Map<string, Review[]>();

  reviews.forEach(review => {
    const propertyReviews = reviewsByProperty.get(review.propertyId) || [];
    propertyReviews.push(review);
    reviewsByProperty.set(review.propertyId, propertyReviews);
  });

  // Calculate metrics for each property
  return Array.from(reviewsByProperty.entries()).map(([propertyId, propertyReviews]) => {
    // Property name from ID
    const propertyName = propertyId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Calculate average rating
    const ratingsWithValue = propertyReviews
      .filter(r => r.rating !== null && r.rating !== undefined)
      .map(r => r.rating!);

    const averageRating =
      ratingsWithValue.length > 0
        ? ratingsWithValue.reduce((sum, r) => sum + r, 0) / ratingsWithValue.length
        : 0;

    // Calculate category ratings
    const categoryRatings: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    propertyReviews.forEach(review => {
      if (review.categories && Array.isArray(review.categories)) {
        review.categories.forEach((cat: { category: string; rating: number }) => {
          if (!categoryRatings[cat.category]) {
            categoryRatings[cat.category] = 0;
            categoryCounts[cat.category] = 0;
          }
          categoryRatings[cat.category] += cat.rating;
          categoryCounts[cat.category]++;
        });
      }
    });

    // Calculate averages for each category
    Object.keys(categoryRatings).forEach(category => {
      categoryRatings[category] =
        Math.round((categoryRatings[category] / categoryCounts[category]) * 10) / 10;
    });

    // Calculate recent trends (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentReviews = propertyReviews.filter(
      r => r.submittedAt >= thirtyDaysAgo && r.rating !== null
    );
    const previousReviews = propertyReviews.filter(
      r => r.submittedAt >= sixtyDaysAgo && r.submittedAt < thirtyDaysAgo && r.rating !== null
    );

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (recentReviews.length > 0 && previousReviews.length > 0) {
      const recentAvg =
        recentReviews.reduce((sum, r) => sum + r.rating!, 0) / recentReviews.length;
      const previousAvg =
        previousReviews.reduce((sum, r) => sum + r.rating!, 0) / previousReviews.length;

      const diff = recentAvg - previousAvg;
      trendPercentage = Math.round(Math.abs((diff / previousAvg) * 100));

      if (diff > 0.2) {
        trendDirection = 'up';
      } else if (diff < -0.2) {
        trendDirection = 'down';
      }
    }

    return {
      propertyId,
      propertyName,
      totalReviews: propertyReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryRatings,
      recentTrends: {
        direction: trendDirection,
        percentage: trendPercentage,
      },
    };
  });
}
