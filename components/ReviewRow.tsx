/**
 * ReviewRow Component
 *
 * Individual row in the reviews table
 */

'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Badge } from './Badge';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewRowProps {
  review: Review;
  onToggleDisplay: (reviewId: string, display: boolean) => Promise<void>;
}

export function ReviewRow({ review, onToggleDisplay }: ReviewRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUpdating(true);
    try {
      await onToggleDisplay(review.id, e.target.checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const propertyName = review.propertyId
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={review.displayOnWebsite}
          onChange={handleCheckboxChange}
          disabled={isUpdating}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
      </td>

      {/* Property */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
          {propertyName}
        </div>
      </td>

      {/* Guest Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{review.guestName}</div>
      </td>

      {/* Rating */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StarRating rating={review.rating} scale={10} size="sm" />
      </td>

      {/* Review Text */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-700 max-w-md">
          {isExpanded ? review.publicReview : truncateText(review.publicReview, 100)}
          {review.publicReview.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Categories */}
        {review.categories && review.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {review.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
              >
                {cat.category}: {cat.rating}
              </span>
            ))}
          </div>
        )}
      </td>

      {/* Channel */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="channel" value={review.channel}>
          {review.channel}
        </Badge>
      </td>

      {/* Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="type" value={review.reviewType}>
          {review.reviewType === 'guest-to-host' ? 'Guest → Host' : 'Host → Guest'}
        </Badge>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(review.submittedAt)}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="status" value={review.status}>
          {review.status}
        </Badge>
      </td>
    </tr>
  );
}
