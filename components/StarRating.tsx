/**
 * StarRating Component
 *
 * Displays star ratings with visual representation
 * Supports both 0-10 scale (Hostaway) and 0-5 scale (display)
 */

interface StarRatingProps {
  rating: number | null;
  scale?: 10 | 5;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function StarRating({
  rating,
  scale = 10,
  size = 'md',
  showNumber = true
}: StarRatingProps) {
  if (rating === null) {
    return <span className="text-gray-400 text-sm">No rating</span>;
  }

  // Convert to 5-star scale if needed
  const normalizedRating = scale === 10 ? rating / 2 : rating;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <span className="text-yellow-400">⯪</span>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>

      {showNumber && (
        <span className={`font-semibold text-gray-700 ${sizeClasses[size]}`}>
          {normalizedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
