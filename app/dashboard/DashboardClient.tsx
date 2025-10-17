/**
 * Dashboard Client Component
 *
 * Client-side interactive dashboard with filtering and review management
 */

'use client';

import { useState, useCallback } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterBar } from '@/components/FilterBar';
import { ReviewTable } from '@/components/ReviewTable';
import { TrendInsights } from '@/components/TrendInsights';
import { toggleReviewDisplay } from '@/app/actions';
import type { Review, PropertyPerformance } from '@/types';

interface DashboardClientProps {
  initialReviews: Review[];
  properties: PropertyPerformance[];
}

export function DashboardClient({ initialReviews, properties }: DashboardClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(initialReviews);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const handleFilterChange = useCallback((filtered: Review[]) => {
    setFilteredReviews(filtered);
  }, []);

  const handlePropertyClick = (propertyId: string) => {
    if (selectedProperty === propertyId) {
      setSelectedProperty(null);
      setFilteredReviews(reviews);
    } else {
      setSelectedProperty(propertyId);
      setFilteredReviews(reviews.filter(r => r.propertyId === propertyId));
    }
  };

  const handleToggleDisplay = async (reviewId: string, display: boolean) => {
    const result = await toggleReviewDisplay(reviewId, display);

    if (result.success) {
      // Optimistically update local state
      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === reviewId ? { ...r, displayOnWebsite: display } : r
        )
      );
      setFilteredReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === reviewId ? { ...r, displayOnWebsite: display } : r
        )
      );
    } else {
      console.error('Failed to update review:', result.error);
      alert('Failed to update review. Please try again.');
    }
  };

  // Calculate statistics for filtered reviews
  const selectedForWebsite = filteredReviews.filter(r => r.displayOnWebsite).length;

  return (
    <div className="space-y-6">
      {/* Property Performance Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard
              key={property.propertyId}
              property={property}
              onClick={() => handlePropertyClick(property.propertyId)}
            />
          ))}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-gray-900">{filteredReviews.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-gray-900">
            {filteredReviews.length > 0
              ? (
                  filteredReviews
                    .filter(r => r.rating !== null)
                    .reduce((sum, r) => sum + r.rating!, 0) /
                  filteredReviews.filter(r => r.rating !== null).length
                ).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 10</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Selected for Website</h3>
          <p className="text-3xl font-bold text-blue-600">{selectedForWebsite}</p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredReviews.length > 0
              ? `${Math.round((selectedForWebsite / filteredReviews.length) * 100)}% of reviews`
              : 'No reviews'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Properties</h3>
          <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
          <p className="text-xs text-gray-500 mt-1">total properties</p>
        </div>
      </div>

      {/* Trend Insights */}
      <TrendInsights reviews={filteredReviews} />

      {/* Filter Bar */}
      <FilterBar reviews={reviews} onFilterChange={handleFilterChange} />

      {/* Reviews Table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Reviews
            {selectedProperty && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                (Filtered by property)
              </span>
            )}
          </h2>
          {selectedProperty && (
            <button
              onClick={() => {
                setSelectedProperty(null);
                setFilteredReviews(reviews);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear property filter
            </button>
          )}
        </div>

        <ReviewTable
          reviews={filteredReviews}
          onToggleDisplay={handleToggleDisplay}
        />
      </div>
    </div>
  );
}
