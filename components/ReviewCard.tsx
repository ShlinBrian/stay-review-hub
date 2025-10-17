/**
 * ReviewCard Component
 *
 * Display individual review on public property page
 */

import { StarRating } from './StarRating';
import { Badge } from './Badge';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-lg">{review.guestName}</p>
          <p className="text-sm text-gray-500 mt-1">{formatDate(review.submittedAt)}</p>
        </div>
        <div className="ml-4">
          <StarRating rating={review.rating} scale={10} size="md" />
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>
      </div>

      {/* Category Ratings */}
      {review.categories && review.categories.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Category Ratings
          </p>
          <div className="flex flex-wrap gap-2">
            {review.categories.map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
              >
                {cat.category}: <span className="font-semibold ml-1">{cat.rating}/10</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Channel Badge (subtle) */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Badge variant="channel" value={review.channel}>
          Via {review.channel}
        </Badge>
      </div>
    </div>
  );
}
