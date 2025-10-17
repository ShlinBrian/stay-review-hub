/**
 * Database Operations for Flex Living Reviews Dashboard
 *
 * This file contains all database operations using Prisma.
 * Handles CRUD operations for Properties and Reviews.
 */

import { prisma } from './prisma';
import type { Review, Property, PropertyPerformance } from '@/types';

/**
 * Save reviews to database with upsert logic
 *
 * Creates or updates reviews and their associated properties.
 * Uses upsert to avoid duplicates and handle updates gracefully.
 *
 * @param reviews - Array of normalized Review objects
 * @returns Promise that resolves when all reviews are saved
 */
export async function saveReviewsToDb(reviews: Review[]): Promise<void> {
  try {
    console.log(`Saving ${reviews.length} reviews to database...`);

    // Group reviews by property to batch process
    const reviewsByProperty = new Map<string, Review[]>();

    for (const review of reviews) {
      const propertyReviews = reviewsByProperty.get(review.propertyId) || [];
      propertyReviews.push(review);
      reviewsByProperty.set(review.propertyId, propertyReviews);
    }

    // Process each property and its reviews
    for (const [propertyId, propertyReviews] of reviewsByProperty) {
      const propertyName = propertyReviews[0]?.guestName
        ? getPropertyNameFromId(propertyId)
        : 'Unknown Property';

      // Ensure property exists
      await prisma.property.upsert({
        where: { id: propertyId },
        update: { name: propertyName },
        create: {
          id: propertyId,
          name: propertyName,
        },
      });

      // Upsert each review
      for (const review of propertyReviews) {
        await prisma.review.upsert({
          where: { id: review.id },
          update: {
            guestName: review.guestName,
            rating: review.rating,
            publicReview: review.publicReview,
            channel: review.channel,
            reviewType: review.reviewType,
            status: review.status,
            displayOnWebsite: review.displayOnWebsite,
            categories: JSON.stringify(review.categories),
            submittedAt: review.submittedAt,
          },
          create: {
            id: review.id,
            propertyId: review.propertyId,
            guestName: review.guestName,
            rating: review.rating,
            publicReview: review.publicReview,
            channel: review.channel,
            reviewType: review.reviewType,
            status: review.status,
            displayOnWebsite: review.displayOnWebsite,
            categories: JSON.stringify(review.categories),
            submittedAt: review.submittedAt,
          },
        });
      }
    }

    console.log(`Successfully saved ${reviews.length} reviews`);
  } catch (error) {
    console.error('Error saving reviews to database:', error);
    throw error;
  }
}

/**
 * Get all reviews for a specific property
 *
 * @param propertyId - The property ID
 * @returns Promise resolving to array of Review objects
 */
export async function getReviewsByProperty(propertyId: string): Promise<Review[]> {
  try {
    const dbReviews = await prisma.review.findMany({
      where: { propertyId },
      orderBy: { submittedAt: 'desc' },
    });

    return dbReviews.map((dbReview) => ({
      id: dbReview.id,
      propertyId: dbReview.propertyId,
      guestName: dbReview.guestName,
      rating: dbReview.rating,
      publicReview: dbReview.publicReview,
      channel: dbReview.channel,
      reviewType: dbReview.reviewType as 'host-to-guest' | 'guest-to-host',
      status: dbReview.status,
      displayOnWebsite: dbReview.displayOnWebsite,
      categories: JSON.parse(dbReview.categories),
      submittedAt: dbReview.submittedAt,
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
    }));
  } catch (error) {
    console.error(`Error fetching reviews for property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Get all reviews with optional filtering
 *
 * @param filters - Optional filter criteria
 * @returns Promise resolving to array of Review objects
 */
export async function getAllReviews(filters?: {
  displayOnWebsite?: boolean;
  propertyId?: string;
}): Promise<Review[]> {
  try {
    const dbReviews = await prisma.review.findMany({
      where: filters,
      orderBy: { submittedAt: 'desc' },
      include: {
        property: true,
      },
    });

    return dbReviews.map((dbReview) => ({
      id: dbReview.id,
      propertyId: dbReview.propertyId,
      guestName: dbReview.guestName,
      rating: dbReview.rating,
      publicReview: dbReview.publicReview,
      channel: dbReview.channel,
      reviewType: dbReview.reviewType as 'host-to-guest' | 'guest-to-host',
      status: dbReview.status,
      displayOnWebsite: dbReview.displayOnWebsite,
      categories: JSON.parse(dbReview.categories),
      submittedAt: dbReview.submittedAt,
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
}

/**
 * Update a review's display status
 *
 * @param reviewId - The review ID to update
 * @param display - Whether to display on website
 * @returns Promise resolving when update is complete
 */
export async function updateReviewDisplayStatus(
  reviewId: string,
  display: boolean
): Promise<void> {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { displayOnWebsite: display },
    });

    console.log(`Updated review ${reviewId} display status to ${display}`);
  } catch (error) {
    console.error(`Error updating review ${reviewId} display status:`, error);
    throw error;
  }
}

/**
 * Get all properties with review statistics
 *
 * Calculates performance metrics for each property including:
 * - Total review count
 * - Average rating
 * - Category ratings breakdown
 * - Recent trends
 *
 * @returns Promise resolving to array of PropertyPerformance objects
 */
export async function getPropertiesWithReviews(): Promise<PropertyPerformance[]> {
  try {
    const properties = await prisma.property.findMany({
      include: {
        reviews: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    return properties.map((property) => {
      const reviews = property.reviews.map((r) => ({
        ...r,
        categories: JSON.parse(r.categories),
        reviewType: r.reviewType as 'host-to-guest' | 'guest-to-host',
      }));

      // Calculate average rating
      const ratingsWithValue = reviews
        .filter((r) => r.rating !== null)
        .map((r) => r.rating!);

      const averageRating =
        ratingsWithValue.length > 0
          ? ratingsWithValue.reduce((sum, r) => sum + r, 0) / ratingsWithValue.length
          : 0;

      // Calculate category ratings
      const categoryRatings: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      reviews.forEach((review) => {
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
      Object.keys(categoryRatings).forEach((category) => {
        categoryRatings[category] =
          Math.round((categoryRatings[category] / categoryCounts[category]) * 10) / 10;
      });

      // Calculate recent trends (last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentReviews = reviews.filter(
        (r) => r.submittedAt >= thirtyDaysAgo && r.rating !== null
      );
      const previousReviews = reviews.filter(
        (r) => r.submittedAt >= sixtyDaysAgo && r.submittedAt < thirtyDaysAgo && r.rating !== null
      );

      // Default to 'up' but only matters if we have data
      let trendDirection: 'up' | 'down' = 'up';
      let trendPercentage = 0;

      if (recentReviews.length > 0 && previousReviews.length > 0) {
        const recentAvg =
          recentReviews.reduce((sum, r) => sum + r.rating!, 0) / recentReviews.length;
        const previousAvg =
          previousReviews.reduce((sum, r) => sum + r.rating!, 0) / previousReviews.length;

        const diff = recentAvg - previousAvg;
        trendPercentage = Math.round(Math.abs((diff / previousAvg) * 100));

        // Determine direction based on actual change
        if (diff >= 0) {
          trendDirection = 'up';    // Improving or stable
        } else {
          trendDirection = 'down';  // Declining
        }
      }

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        categoryRatings,
        recentTrends: {
          direction: trendDirection,
          percentage: trendPercentage,
        },
      };
    });
  } catch (error) {
    console.error('Error fetching properties with reviews:', error);
    throw error;
  }
}

/**
 * Helper function to convert property ID back to readable name
 *
 * @param propertyId - Property ID in kebab-case
 * @returns Human-readable property name
 */
function getPropertyNameFromId(propertyId: string): string {
  return propertyId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Delete a review by ID
 *
 * @param reviewId - The review ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });

    console.log(`Deleted review ${reviewId}`);
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
}

/**
 * Get a single review by ID
 *
 * @param reviewId - The review ID
 * @returns Promise resolving to Review object or null if not found
 */
export async function getReviewById(reviewId: string): Promise<Review | null> {
  try {
    const dbReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!dbReview) return null;

    return {
      id: dbReview.id,
      propertyId: dbReview.propertyId,
      guestName: dbReview.guestName,
      rating: dbReview.rating,
      publicReview: dbReview.publicReview,
      channel: dbReview.channel,
      reviewType: dbReview.reviewType as 'host-to-guest' | 'guest-to-host',
      status: dbReview.status,
      displayOnWebsite: dbReview.displayOnWebsite,
      categories: JSON.parse(dbReview.categories),
      submittedAt: dbReview.submittedAt,
      createdAt: dbReview.createdAt,
      updatedAt: dbReview.updatedAt,
    };
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error;
  }
}
