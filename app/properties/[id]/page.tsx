/**
 * Public Property Review Display Page
 *
 * This page displays only manager-approved reviews for public viewing
 * with a clean, professional layout matching the Flex Living brand.
 *
 * Route: /properties/[id]
 */

import { getReviewsByProperty } from '@/lib/db';
import { ReviewCard } from '@/components/ReviewCard';
import { StarRating } from '@/components/StarRating';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params;

  // Fetch all reviews for this property
  const allReviews = await getReviewsByProperty(id);

  // Filter to only show approved reviews
  const approvedReviews = allReviews.filter(r => r.displayOnWebsite);

  // Calculate statistics
  const reviewsWithRating = approvedReviews.filter(r => r.rating !== null);
  const averageRating = reviewsWithRating.length > 0
    ? reviewsWithRating.reduce((sum, r) => sum + r.rating!, 0) / reviewsWithRating.length
    : null;

  // Property name from ID
  const propertyName = id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Calculate category breakdown
  const categoryRatings: Record<string, { total: number; count: number }> = {};
  approvedReviews.forEach(review => {
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

  const topCategories = Object.entries(categoryRatings)
    .map(([category, data]) => ({
      category,
      average: data.total / data.count
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              Flex Living
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Manager Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Property Hero */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-96 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {propertyName}
              </h1>
              {averageRating !== null && (
                <div className="flex items-center justify-center gap-3">
                  <StarRating rating={averageRating} scale={10} size="lg" />
                  <span className="text-lg text-gray-600">
                    ({approvedReviews.length} {approvedReviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Property Description */}
          <div className="prose max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed">
              Welcome to {propertyName}, a premium Flex Living property offering exceptional
              comfort and modern amenities in a prime location. Our guests consistently rate
              their experience highly across all categories.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Guest Reviews</h2>

          {/* Summary Statistics */}
          {approvedReviews.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Average Rating */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wider">
                    Average Rating
                  </p>
                  <div className="mb-2">
                    <StarRating rating={averageRating} scale={10} size="lg" showNumber={false} />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    {averageRating?.toFixed(1)}/10
                  </p>
                </div>

                {/* Total Reviews */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wider">
                    Total Reviews
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mt-6">
                    {approvedReviews.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">verified guest reviews</p>
                </div>

                {/* Top Categories */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wider">
                    Top Rated Categories
                  </p>
                  <div className="space-y-2 mt-4">
                    {topCategories.map(({ category, average }) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {average.toFixed(1)}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Cards */}
          {approvedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews yet"
              description="This property doesn't have any public reviews at the moment. Be the first to stay and share your experience!"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Flex Living</h3>
              <p className="text-gray-600 text-sm">
                Premium property management and guest experiences across the UK.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/" className="hover:text-blue-600">Home</Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-blue-600">Manager Dashboard</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <p className="text-sm text-gray-600">
                Email: hello@flexliving.com
                <br />
                Phone: +44 20 1234 5678
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; 2025 Flex Living. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
