/**
 * PropertyCard Component
 *
 * Displays property performance metrics in a card format
 */

'use client';

import { StarRating } from './StarRating';
import { Badge } from './Badge';
import type { PropertyPerformance } from '@/types';

interface PropertyCardProps {
  property: PropertyPerformance;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const { propertyName, totalReviews, averageRating, recentTrends } = property;

  const getTrendIcon = () => {
    if (recentTrends.direction === 'up') return '↑';
    if (recentTrends.direction === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (recentTrends.direction === 'up') return 'text-green-600';
    if (recentTrends.direction === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {propertyName}
          </h3>
          <p className="text-sm text-gray-500">{totalReviews} reviews</p>
        </div>

        {recentTrends.percentage > 0 && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <span className="text-xl">{getTrendIcon()}</span>
            <span className="text-sm font-medium">
              {recentTrends.percentage}%
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <StarRating rating={averageRating} scale={5} size="lg" />
      </div>

      {/* Top categories */}
      {Object.keys(property.categoryRatings).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Top Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(property.categoryRatings)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, rating]) => (
                <Badge key={category} variant="default">
                  {category}: {rating.toFixed(1)}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
