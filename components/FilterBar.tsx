/**
 * FilterBar Component
 *
 * Provides filtering controls for the dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import type { Review } from '@/types';

interface FilterBarProps {
  reviews: Review[];
  onFilterChange: (filteredReviews: Review[]) => void;
}

export function FilterBar({ reviews, onFilterChange }: FilterBarProps) {
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique values for filters
  const properties = Array.from(new Set(reviews.map(r => r.propertyId)));
  const channels = Array.from(new Set(reviews.map(r => r.channel)));
  const types = Array.from(new Set(reviews.map(r => r.reviewType)));

  useEffect(() => {
    const filtered = reviews.filter(review => {
      // Property filter
      if (propertyFilter !== 'all' && review.propertyId !== propertyFilter) {
        return false;
      }

      // Channel filter
      if (channelFilter !== 'all' && review.channel !== channelFilter) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== 'all') {
        const minRating = parseInt(ratingFilter);
        if (!review.rating || review.rating < minRating) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && review.reviewType !== typeFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        const reviewDate = new Date(review.submittedAt);
        const daysAgo = parseInt(dateFilter);
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        if (reviewDate < cutoffDate) {
          return false;
        }
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = review.guestName.toLowerCase().includes(query);
        const matchesReview = review.publicReview.toLowerCase().includes(query);

        if (!matchesName && !matchesReview) {
          return false;
        }
      }

      return true;
    });

    onFilterChange(filtered);
  }, [propertyFilter, channelFilter, ratingFilter, typeFilter, dateFilter, searchQuery, reviews, onFilterChange]);

  const handleClearFilters = () => {
    setPropertyFilter('all');
    setChannelFilter('all');
    setRatingFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    propertyFilter !== 'all' ||
    channelFilter !== 'all' ||
    ratingFilter !== 'all' ||
    typeFilter !== 'all' ||
    dateFilter !== 'all' ||
    searchQuery !== '';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by guest name or review text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Property Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property
          </label>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Properties</option>
            {properties.map(prop => (
              <option key={prop} value={prop}>
                {prop.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Channels</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="9">9+ Stars</option>
            <option value="8">8+ Stars</option>
            <option value="7">7+ Stars</option>
            <option value="6">6+ Stars</option>
            <option value="5">5+ Stars</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' to ')}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
