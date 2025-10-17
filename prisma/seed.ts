/**
 * Database Seed Script
 *
 * Populates the database with mock review data for development and testing.
 * Run with: npm run seed
 */

import { PrismaClient } from '@prisma/client';
import mockData from '../lib/mock-reviews.json';

const prisma = new PrismaClient();

/**
 * Normalize Hostaway review to internal format
 * (Duplicated from utils.ts to avoid import issues in seed script)
 */
function normalizeHostawayReview(raw: any): any {
  // Map listing name to property ID (kebab-case)
  // Handle both listingName and listingMapName fields
  const listingName = raw.listingName || raw.listingMapName;

  if (!listingName) {
    throw new Error(`Review ${raw.id} missing listingName/listingMapName field`);
  }

  const propertyId = listingName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Use the provided overall rating if available, otherwise calculate from categories
  let finalRating: number | null = raw.rating;

  // Only calculate from categories if there's NO overall rating
  if (finalRating === null || finalRating === undefined) {
    const ratings = raw.reviewCategory
      .filter((cat: any) => cat.rating !== null)
      .map((cat: any) => cat.rating);

    finalRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
      : null;
  }

  return {
    id: raw.id.toString(),
    propertyId,
    guestName: raw.guestName,
    rating: finalRating,
    publicReview: raw.publicReview,
    channel: 'hostaway',
    reviewType: raw.type,
    status: raw.status,
    displayOnWebsite: false,
    categories: raw.reviewCategory,
    submittedAt: new Date(raw.submittedAt),
  };
}

/**
 * Get property name from property ID
 */
function getPropertyNameFromId(propertyId: string): string {
  return propertyId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.property.deleteMany();

  // Load and normalize mock reviews
  if (mockData.status !== 'success' || !Array.isArray(mockData.result)) {
    throw new Error('Invalid mock data format');
  }

  console.log(`Found ${mockData.result.length} reviews to seed`);

  const normalizedReviews = mockData.result.map(normalizeHostawayReview);

  // Group reviews by property
  const reviewsByProperty = new Map<string, any[]>();

  for (const review of normalizedReviews) {
    const propertyReviews = reviewsByProperty.get(review.propertyId) || [];
    propertyReviews.push(review);
    reviewsByProperty.set(review.propertyId, propertyReviews);
  }

  console.log(`Found ${reviewsByProperty.size} unique properties`);

  // Create properties and their reviews
  let totalReviewsCreated = 0;

  for (const [propertyId, propertyReviews] of reviewsByProperty) {
    const propertyName = getPropertyNameFromId(propertyId);

    console.log(`Creating property: ${propertyName} (${propertyReviews.length} reviews)`);

    // Create property
    await prisma.property.create({
      data: {
        id: propertyId,
        name: propertyName,
      },
    });

    // Create reviews for this property
    for (const review of propertyReviews) {
      await prisma.review.create({
        data: {
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
      totalReviewsCreated++;
    }
  }

  console.log(`✅ Seed completed successfully!`);
  console.log(`   Properties created: ${reviewsByProperty.size}`);
  console.log(`   Reviews created: ${totalReviewsCreated}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
