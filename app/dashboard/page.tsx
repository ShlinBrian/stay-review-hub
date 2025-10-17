/**
 * Manager Dashboard Page
 *
 * This is the main dashboard where property managers can:
 * - View all reviews across properties
 * - Filter by rating, category, channel, time period
 * - Sort reviews by various criteria
 * - Select reviews for public website display
 * - View performance metrics and trends
 */

import { DashboardClient } from './DashboardClient';
import { getPropertiesWithReviews, getAllReviews } from '@/lib/db';

export default async function DashboardPage() {
  // Fetch data on the server
  const [properties, reviews] = await Promise.all([
    getPropertiesWithReviews(),
    getAllReviews()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage guest feedback across all properties
          </p>
        </div>

        {/* Dashboard Content */}
        <DashboardClient initialReviews={reviews} properties={properties} />
      </div>
    </div>
  );
}
