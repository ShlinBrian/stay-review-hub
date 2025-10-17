/**
 * TrendInsights Component
 *
 * Displays trend statistics and insights
 */

'use client';

import type { Review } from '@/types';

interface TrendInsightsProps {
  reviews: Review[];
}

export function TrendInsights({ reviews }: TrendInsightsProps) {
  // Calculate insights
  const totalReviews = reviews.length;
  const reviewsWithRating = reviews.filter(r => r.rating !== null);
  const averageRating = reviewsWithRating.length > 0
    ? reviewsWithRating.reduce((sum, r) => sum + r.rating!, 0) / reviewsWithRating.length
    : 0;

  // Channel breakdown
  const channelCounts: Record<string, number> = {};
  reviews.forEach(r => {
    channelCounts[r.channel] = (channelCounts[r.channel] || 0) + 1;
  });
  const mostActiveChannel = Object.entries(channelCounts)
    .sort(([, a], [, b]) => b - a)[0];

  // Category analysis
  const categoryRatings: Record<string, { total: number; count: number }> = {};
  reviews.forEach(review => {
    if (review.categories && Array.isArray(review.categories)) {
      review.categories.forEach((cat: { category: string; rating: number }) => {
        if (!categoryRatings[cat.category]) {
          categoryRatings[cat.category] = { total: 0, count: 0 };
        }
        categoryRatings[cat.category].total += cat.rating;
        categoryRatings[cat.category].count++;
      });
    }
  });

  const topCategory = Object.entries(categoryRatings)
    .map(([category, data]) => ({
      category,
      average: data.total / data.count
    }))
    .sort((a, b) => b.average - a.average)[0];

  // Recent reviews (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentReviewsCount = reviews.filter(
    r => new Date(r.submittedAt) >= sevenDaysAgo
  ).length;

  // Selected for website
  const selectedCount = reviews.filter(r => r.displayOnWebsite).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Rating */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 10</p>
        </div>

        {/* Most Active Channel */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Most Active Channel</p>
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {mostActiveChannel ? mostActiveChannel[0] : 'N/A'}
          </p>
          {mostActiveChannel && (
            <p className="text-xs text-gray-500 mt-1">
              {mostActiveChannel[1]} reviews
            </p>
          )}
        </div>

        {/* Top Category */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Top Rated Category</p>
          <p className="text-xl font-bold text-gray-900 capitalize">
            {topCategory ? topCategory.category : 'N/A'}
          </p>
          {topCategory && (
            <p className="text-xs text-gray-500 mt-1">
              {topCategory.average.toFixed(1)} average
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Recent Reviews</p>
          <p className="text-3xl font-bold text-gray-900">
            {recentReviewsCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">last 7 days</p>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Selected for Website</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {selectedCount} / {totalReviews}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Selection Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalReviews > 0 ? Math.round((selectedCount / totalReviews) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
