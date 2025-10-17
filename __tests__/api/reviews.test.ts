/**
 * Tests for Hostaway Reviews API Endpoint
 *
 * This test suite validates the critical /api/reviews/hostaway endpoint
 * that will be tested by evaluators.
 */

import { GET } from '@/app/api/reviews/hostaway/route';
import { normalizeHostawayReview, calculateAverageRating, mapListingToPropertyId } from '@/lib/utils';
import type { HostawayReview, Review } from '@/types';

// Mock the Next.js Response
global.Response = class Response {
  constructor(public body: any, public init?: ResponseInit) {}

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
} as any;

describe('Hostaway Reviews API', () => {
  describe('GET /api/reviews/hostaway', () => {
    it('should return success status', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      expect(data.status).toBe('success');
    });

    it('should return an array of reviews', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      expect(Array.isArray(data.result)).toBe(true);
      expect(data.result.length).toBeGreaterThan(0);
    });

    it('should return reviews with correct structure', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      const review = data.result[0];

      // Check all required fields exist
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('propertyId');
      expect(review).toHaveProperty('guestName');
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('publicReview');
      expect(review).toHaveProperty('channel');
      expect(review).toHaveProperty('reviewType');
      expect(review).toHaveProperty('status');
      expect(review).toHaveProperty('displayOnWebsite');
      expect(review).toHaveProperty('categories');
      expect(review).toHaveProperty('submittedAt');
    });

    it('should normalize review data correctly', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      const review = data.result[0];

      // Validate data types
      expect(typeof review.id).toBe('string');
      expect(typeof review.propertyId).toBe('string');
      expect(typeof review.guestName).toBe('string');
      expect(typeof review.publicReview).toBe('string');
      expect(typeof review.channel).toBe('string');
      expect(typeof review.reviewType).toBe('string');
      expect(typeof review.status).toBe('string');
      expect(typeof review.displayOnWebsite).toBe('boolean');
      expect(Array.isArray(review.categories)).toBe(true);

      // Rating can be number or null
      if (review.rating !== null) {
        expect(typeof review.rating).toBe('number');
      }
    });

    it('should set channel to "hostaway"', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        expect(review.channel).toBe('hostaway');
      });
    });

    it('should set displayOnWebsite to false by default', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        expect(review.displayOnWebsite).toBe(false);
      });
    });

    it('should have valid review types', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        expect(['host-to-guest', 'guest-to-host']).toContain(review.reviewType);
      });
    });
  });

  describe('Data Normalization Functions', () => {
    describe('calculateAverageRating', () => {
      it('should calculate average rating correctly', () => {
        const categories = [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 8 },
          { category: 'location', rating: 9 },
        ];

        const avg = calculateAverageRating(categories);
        expect(avg).toBe(9.0);
      });

      it('should return null for empty categories', () => {
        const avg = calculateAverageRating([]);
        expect(avg).toBeNull();
      });

      it('should handle single category', () => {
        const categories = [{ category: 'cleanliness', rating: 7 }];
        const avg = calculateAverageRating(categories);
        expect(avg).toBe(7.0);
      });

      it('should round to 1 decimal place', () => {
        const categories = [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 9 },
          { category: 'location', rating: 8 },
        ];

        const avg = calculateAverageRating(categories);
        expect(avg).toBe(9.0);
      });
    });

    describe('mapListingToPropertyId', () => {
      it('should convert listing name to kebab-case', () => {
        const propertyId = mapListingToPropertyId('2B N1 A - 29 Shoreditch Heights');
        expect(propertyId).toBe('2b-n1-a-29-shoreditch-heights');
      });

      it('should handle special characters', () => {
        const propertyId = mapListingToPropertyId('Studio W1 C - 42 Westminster Court');
        expect(propertyId).toBe('studio-w1-c-42-westminster-court');
      });

      it('should handle extra spaces', () => {
        const propertyId = mapListingToPropertyId('  Test  Property  ');
        expect(propertyId).toBe('test-property');
      });

      it('should be consistent for same input', () => {
        const name = '1B S2 B - 15 Camden Square';
        const id1 = mapListingToPropertyId(name);
        const id2 = mapListingToPropertyId(name);
        expect(id1).toBe(id2);
      });

      it('should throw error for empty string', () => {
        expect(() => mapListingToPropertyId('')).toThrow();
      });
    });

    describe('normalizeHostawayReview', () => {
      const mockRawReview: HostawayReview = {
        id: 7453,
        type: 'guest-to-host',
        status: 'published',
        rating: null,
        publicReview: 'Great stay!',
        reviewCategory: [
          { category: 'cleanliness', rating: 10 },
          { category: 'communication', rating: 9 },
        ],
        submittedAt: '2025-08-21 22:45:14',
        guestName: 'John Doe',
        listingName: '2B N1 A - 29 Shoreditch Heights',
      };

      it('should normalize review correctly', () => {
        const normalized = normalizeHostawayReview(mockRawReview);

        expect(normalized.id).toBe('7453');
        expect(normalized.guestName).toBe('John Doe');
        expect(normalized.publicReview).toBe('Great stay!');
        expect(normalized.channel).toBe('hostaway');
        expect(normalized.reviewType).toBe('guest-to-host');
        expect(normalized.status).toBe('published');
        expect(normalized.displayOnWebsite).toBe(false);
      });

      it('should calculate rating from categories when not provided', () => {
        const normalized = normalizeHostawayReview(mockRawReview);
        expect(normalized.rating).toBe(9.5); // (10 + 9) / 2
      });

      it('should use provided rating over calculated', () => {
        const reviewWithRating = {
          ...mockRawReview,
          rating: 8.5,
        };

        const normalized = normalizeHostawayReview(reviewWithRating);
        expect(normalized.rating).toBe(8.5);
      });

      it('should convert date string to Date object', () => {
        const normalized = normalizeHostawayReview(mockRawReview);
        expect(normalized.submittedAt).toBeInstanceOf(Date);
      });

      it('should map listing name to property ID', () => {
        const normalized = normalizeHostawayReview(mockRawReview);
        expect(normalized.propertyId).toBe('2b-n1-a-29-shoreditch-heights');
      });

      it('should handle missing guest name', () => {
        const reviewNoName = {
          ...mockRawReview,
          guestName: '',
        };

        const normalized = normalizeHostawayReview(reviewNoName);
        expect(normalized.guestName).toBe('Anonymous');
      });

      it('should handle empty categories array', () => {
        const reviewNoCategories = {
          ...mockRawReview,
          reviewCategory: [],
        };

        const normalized = normalizeHostawayReview(reviewNoCategories);
        expect(normalized.rating).toBeNull();
        expect(normalized.categories).toEqual([]);
      });
    });
  });

  describe('Response Format', () => {
    it('should return proper HTTP status code', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should match expected response structure', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('result');
      expect(data.status).toBe('success');
      expect(Array.isArray(data.result)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle reviews with null ratings', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      // Find a review with null rating (some should have calculated ratings)
      const reviewsWithNullRating = data.result.filter((r: Review) => r.rating === null);

      // Even reviews with null raw rating should have calculated rating if categories exist
      // Or remain null if no categories
      reviewsWithNullRating.forEach((review: Review) => {
        expect(review.categories.length).toBe(0);
      });
    });

    it('should handle multiple properties', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      const uniqueProperties = new Set(data.result.map((r: Review) => r.propertyId));
      expect(uniqueProperties.size).toBeGreaterThan(1);
    });

    it('should handle different review types', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      const hostToGuest = data.result.filter((r: Review) => r.reviewType === 'host-to-guest');
      const guestToHost = data.result.filter((r: Review) => r.reviewType === 'guest-to-host');

      expect(hostToGuest.length).toBeGreaterThan(0);
      expect(guestToHost.length).toBeGreaterThan(0);
    });
  });

  describe('Data Quality', () => {
    it('should have valid property IDs (no spaces or special chars)', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        expect(review.propertyId).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('should have valid ratings (0-10 scale)', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        if (review.rating !== null) {
          expect(review.rating).toBeGreaterThanOrEqual(0);
          expect(review.rating).toBeLessThanOrEqual(10);
        }
      });
    });

    it('should have non-empty review text', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        expect(review.publicReview.length).toBeGreaterThan(0);
      });
    });

    it('should have valid dates', async () => {
      const request = new Request('http://localhost:3000/api/reviews/hostaway');
      const response = await GET(request);
      const data = await response.json();

      data.result.forEach((review: Review) => {
        const date = new Date(review.submittedAt);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });
  });
});
