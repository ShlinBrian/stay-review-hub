/**
 * Type Definitions for Flex Living Reviews Dashboard
 *
 * These types define the data structures used throughout the application,
 * including API responses, database models, and UI components.
 */

// ============================================================================
// Hostaway API Types (Raw API Response)
// ============================================================================

/**
 * Category rating object from Hostaway API
 */
export interface HostawayReviewCategory {
  category: string;
  rating: number;
}

/**
 * Raw review data structure from Hostaway API
 * This is the format we receive from the API endpoint
 */
export interface HostawayReview {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: HostawayReviewCategory[];
  submittedAt: string; // ISO date string
  guestName: string;
  listingName: string;
}

/**
 * Hostaway API response wrapper
 */
export interface HostawayApiResponse {
  status: 'success' | 'error';
  result: HostawayReview[];
}

// ============================================================================
// Application Types (Normalized Internal Format)
// ============================================================================

/**
 * Normalized review category for internal use
 */
export interface ReviewCategory {
  category: string;
  rating: number;
}

/**
 * Normalized review data structure used throughout the application
 * This matches our Prisma schema
 */
export interface Review {
  id: string;
  propertyId: string;
  guestName: string;
  rating: number | null;
  publicReview: string;
  channel: string; // e.g., 'hostaway', 'airbnb', 'booking'
  reviewType: 'host-to-guest' | 'guest-to-host';
  status: string;
  displayOnWebsite: boolean;
  categories: ReviewCategory[];
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Property data structure
 */
export interface Property {
  id: string;
  name: string;
  reviews?: Review[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// UI/Component Types
// ============================================================================

/**
 * Filter options for the manager dashboard
 */
export interface ReviewFilters {
  propertyId?: string;
  channel?: string;
  reviewType?: 'host-to-guest' | 'guest-to-host' | 'all';
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  displayOnWebsite?: boolean;
}

/**
 * Sort options for review lists
 */
export type SortField = 'submittedAt' | 'rating' | 'guestName' | 'channel';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

/**
 * Dashboard statistics
 */
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  reviewsByChannel: Record<string, number>;
  reviewsByType: Record<string, number>;
  selectedForWebsite: number;
}

/**
 * Property performance metrics
 */
export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  totalReviews: number;
  averageRating: number;
  categoryRatings: Record<string, number>;
  recentTrends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  result?: T;
  error?: string;
  message?: string;
}

/**
 * Reviews API response
 */
export type ReviewsApiResponse = ApiResponse<Review[]>;

/**
 * Property API response
 */
export type PropertyApiResponse = ApiResponse<Property>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
