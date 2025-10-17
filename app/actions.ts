/**
 * Server Actions for Flex Living Reviews Dashboard
 *
 * These functions run on the server and can be called from client components
 * to update database state without creating API routes.
 */

'use server';

import { updateReviewDisplayStatus } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Update a review's display status
 *
 * @param reviewId - The review ID to update
 * @param display - Whether to display on website
 * @returns Success status and optional error message
 */
export async function toggleReviewDisplay(reviewId: string, display: boolean) {
  try {
    await updateReviewDisplayStatus(reviewId, display);

    // Revalidate relevant pages so they show updated data
    revalidatePath('/dashboard');
    revalidatePath('/properties/[id]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error updating review display status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update review'
    };
  }
}

/**
 * Batch update multiple reviews' display status
 *
 * @param updates - Array of {reviewId, display} objects
 * @returns Success status and optional error message
 */
export async function batchToggleReviewDisplay(
  updates: Array<{ reviewId: string; display: boolean }>
) {
  try {
    await Promise.all(
      updates.map(({ reviewId, display }) =>
        updateReviewDisplayStatus(reviewId, display)
      )
    );

    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/properties/[id]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error batch updating review display status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reviews'
    };
  }
}
