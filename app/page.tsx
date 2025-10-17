import Link from 'next/link'
import { getPropertiesWithReviews } from '@/lib/db'
import { loadMockReviewsNormalized, calculatePropertyPerformance } from '@/lib/mock-data'

export const dynamic = 'force-dynamic';

export default async function Home() {
  let properties: Awaited<ReturnType<typeof getPropertiesWithReviews>> = [];

  try {
    properties = await getPropertiesWithReviews();
  } catch (error) {
    console.error('Error fetching properties from database:', error);
    console.log('Falling back to mock data...');

    // Load mock data as fallback
    try {
      const mockReviews = await loadMockReviewsNormalized();
      properties = calculatePropertyPerformance(mockReviews);
      console.log(`Loaded ${properties.length} properties from mock data`);
    } catch (mockError) {
      console.error('Error loading mock data:', mockError);
      // Use empty array if mock data also fails
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <main className="flex flex-col items-center gap-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Flex Living Reviews Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Property management reviews dashboard for analyzing and displaying guest reviews
            </p>
          </div>

          {/* Main Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              Manager Dashboard
            </Link>

            <Link
              href="/api/reviews/hostaway"
              className="px-8 py-4 bg-gray-600 text-white rounded-lg text-center hover:bg-gray-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              View API Endpoint
            </Link>
          </div>

          {/* Properties Section */}
          <div className="w-full max-w-5xl mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Link
                  key={property.propertyId}
                  href={`/properties/${property.propertyId}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.propertyName}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">/ 10</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {property.totalReviews} reviews
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full max-w-3xl mt-8 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">For Managers</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                      Manager Dashboard
                    </Link>
                    <p className="text-gray-600">Filter, sort, and select reviews</p>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">For Developers</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/api/reviews/hostaway" className="text-blue-600 hover:underline">
                      Hostaway API
                    </Link>
                    <p className="text-gray-600">Normalized review data endpoint</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
