/**
 * ReviewTable Component
 *
 * Main table displaying reviews with sorting capabilities
 */

'use client';

import { useState } from 'react';
import { ReviewRow } from './ReviewRow';
import { EmptyState } from './EmptyState';
import type { Review, SortField, SortDirection } from '@/types';

interface ReviewTableProps {
  reviews: Review[];
  onToggleDisplay: (reviewId: string, display: boolean) => Promise<void>;
}

export function ReviewTable({ reviews, onToggleDisplay }: ReviewTableProps) {
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null ratings
    if (sortField === 'rating') {
      aValue = aValue ?? -1;
      bValue = bValue ?? -1;
    }

    // Handle dates
    if (sortField === 'submittedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle strings
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <EmptyState
          title="No reviews found"
          description="No reviews match your current filters. Try adjusting your search criteria."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Display
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('channel')}
              >
                <div className="flex items-center gap-1">
                  Property
                  <SortIcon field="channel" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('guestName')}
              >
                <div className="flex items-center gap-1">
                  Guest
                  <SortIcon field="guestName" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center gap-1">
                  Rating
                  <SortIcon field="rating" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Review & Categories
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('channel')}
              >
                <div className="flex items-center gap-1">
                  Channel
                  <SortIcon field="channel" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submittedAt')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon field="submittedAt" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onToggleDisplay={onToggleDisplay}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
