# Google Reviews Integration Research

## Executive Summary
**Feasibility: Medium** - Technically feasible but requires Google Cloud billing account setup and has notable limitations. The integration is straightforward but comes with costs and the API only returns 5 reviews at a time, which may not be sufficient for properties with many reviews.

## API Overview
- **API Name:** Google Places API - Place Details (New)
- **Documentation:** https://developers.google.com/maps/documentation/places/web-service/place-details
- **Access Requirements:**
  - Google Cloud Platform account
  - Billing enabled (credit card required)
  - API key with Places API enabled
  - Place ID for each property

## Feasibility Assessment

### Technical Feasibility: High
The technical implementation is straightforward:

**Endpoint:** `https://places.googleapis.com/v1/places/{PLACE_ID}`

**HTTP Method:** GET

**Required Headers:**
```
X-Goog-Api-Key: YOUR_API_KEY
X-Goog-FieldMask: id,displayName,rating,reviews
```

**Sample Response:**
```json
{
  "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "displayName": {
    "text": "Property Name",
    "languageCode": "en"
  },
  "rating": 4.7,
  "reviews": [
    {
      "name": "places/ChIJ.../reviews/...",
      "relativePublishTimeDescription": "2 months ago",
      "rating": 5,
      "text": {
        "text": "Great place to stay!",
        "languageCode": "en"
      },
      "originalText": {
        "text": "Great place to stay!",
        "languageCode": "en"
      },
      "authorAttribution": {
        "displayName": "John Doe",
        "uri": "https://www.google.com/maps/contrib/...",
        "photoUri": "https://lh3.googleusercontent.com/..."
      },
      "publishTime": "2025-08-15T10:30:00Z"
    }
  ]
}
```

### Cost Analysis
**Free Tier:** $200/month credit (automatically applied until February 28, 2025)

**Pricing Structure:**
- **Place Details (Basic):** $17 per 1,000 requests
- **Place Details (Contact):** $20 per 1,000 requests
- **Place Details (Atmosphere):** $24 per 1,000 requests

**Note:** Reviews are part of the "Atmosphere" data category, so fetching reviews costs $24 per 1,000 requests.

**Estimated Cost for Flex Living:**
Assuming:
- 5 properties
- Daily review sync (once per property per day)
- 5 properties × 30 days = 150 requests/month

**Monthly Cost:** 150 requests × $24 / 1,000 = $0.36/month (well within free tier)

For realistic usage with multiple daily syncs or more properties:
- 500 requests/month = $12/month
- 1,000 requests/month = $24/month

The $200 monthly credit covers approximately 8,300 Place Details (Atmosphere) requests.

### Rate Limits
- **Queries Per Second (QPS):** No hard limit, but subject to fair use policies
- **Daily Quota:** Set by your Google Cloud project (default is generous)
- **Best Practice:** Implement caching to minimize API calls
- **Recommendation:** Fetch reviews every 24 hours rather than real-time

### Data Structure

**Google Places API Review Object:**
```typescript
interface GoogleReview {
  name: string;                          // Unique review identifier
  relativePublishTimeDescription: string; // "2 months ago"
  rating: number;                        // 1-5
  text: {
    text: string;                        // Review content
    languageCode: string;
  };
  originalText: {
    text: string;                        // Original language text
    languageCode: string;
  };
  authorAttribution: {
    displayName: string;                 // Reviewer name
    uri: string;                         // Profile URL
    photoUri: string;                    // Profile photo
  };
  publishTime: string;                   // ISO 8601 timestamp
}
```

**Normalized to Internal Format:**
```typescript
interface Review {
  id: string;                   // From review name
  propertyId: string;           // From place ID mapping
  guestName: string;            // From authorAttribution.displayName
  rating: number;               // Direct mapping (1-5 scale)
  publicReview: string;         // From text.text
  channel: "google";            // Fixed value
  reviewType: "guest-to-host";  // Google reviews are always guest reviews
  status: "published";          // Google only shows published reviews
  displayOnWebsite: false;      // Default, manager must approve
  categories: [];               // Google doesn't provide category breakdowns
  submittedAt: Date;            // From publishTime
}
```

### Integration Approach

#### Phase 1: Setup (30 minutes)
1. Create Google Cloud Platform account
2. Enable Places API (New)
3. Create API key with appropriate restrictions:
   - API restrictions: Limit to Places API
   - Application restrictions: HTTP referrers or IP addresses
4. Add `GOOGLE_API_KEY` to environment variables
5. Obtain Place IDs for all 5 Flex Living properties

#### Phase 2: Implementation (2-3 hours)
1. Create `/app/api/reviews/google/route.ts` endpoint:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_API_KEY!,
        'X-Goog-FieldMask': 'id,displayName,rating,reviews'
      }
    }
  );

  const data = await response.json();
  const normalized = normalizeGoogleReviews(data);

  return Response.json({ status: 'success', result: normalized });
}
```

2. Create normalization function in `lib/db.ts`:
```typescript
function normalizeGoogleReview(review: GoogleReview, propertyId: string): Review {
  return {
    id: review.name.split('/').pop() || crypto.randomUUID(),
    propertyId,
    guestName: review.authorAttribution.displayName,
    rating: review.rating,
    publicReview: review.text.text,
    channel: 'google',
    reviewType: 'guest-to-host',
    status: 'published',
    displayOnWebsite: false,
    categories: [], // Google doesn't provide detailed categories
    submittedAt: new Date(review.publishTime)
  };
}
```

3. Update dashboard to fetch from both sources:
```typescript
const [hostawayReviews, googleReviews] = await Promise.all([
  fetchHostawayReviews(),
  fetchGoogleReviews()
]);
const allReviews = [...hostawayReviews, ...googleReviews];
```

4. Add "Google" to channel filter options in dashboard

#### Phase 3: Testing (1 hour)
1. Test API endpoint with valid Place IDs
2. Verify data normalization
3. Test dashboard with mixed review sources
4. Verify filtering by channel works correctly

### Challenges

#### 1. Limited Review Count
**Issue:** Google Places API only returns 5 most relevant reviews per request
**Impact:** If a property has 50+ reviews, you only see 5 at a time
**Workaround:**
- Use `reviews_sort=newest` parameter to get most recent reviews
- Make multiple requests with different sorting (not recommended due to cost)
- Accept the limitation as a sample of reviews

#### 2. No Category Ratings
**Issue:** Google reviews are a single 1-5 star rating with text
**Impact:** Cannot analyze by category (cleanliness, communication, location)
**Workaround:** Set categories to empty array, use text analysis if needed

#### 3. Requires Billing Account
**Issue:** Must enable billing with credit card, even for free tier usage
**Impact:** Barrier to immediate implementation for testing
**Workaround:** Use Google Cloud free trial ($300 credit for 90 days)

#### 4. No Real-Time Updates
**Issue:** API requires polling; no webhooks for new reviews
**Impact:** Need scheduled job to fetch reviews periodically
**Workaround:** Use cron job or Next.js route handler with scheduled execution

#### 5. Place ID Management
**Issue:** Must manually find and map Place IDs to properties
**Impact:** Initial setup overhead
**Workaround:** Use Google Maps to search properties and extract Place IDs from URLs

### Recommendation
**Implement with Caveats**

**Reasoning:**
- **Pro:** Relatively low cost ($0.36-$12/month for typical usage)
- **Pro:** Simple technical implementation (2-3 hours of work)
- **Pro:** Adds valuable social proof from Google Maps users
- **Pro:** $200 monthly credit makes it essentially free for this use case
- **Con:** Only 5 reviews per property limits comprehensive analysis
- **Con:** Requires Google Cloud account with billing enabled
- **Con:** Adds dependency on external service with rate limits

**Best Use Case:** Complement Hostaway reviews with a sample of Google reviews for additional social proof on public property pages. Use Hostaway as primary source for comprehensive dashboard analysis.

### Implementation Estimate
- **Setup Time:** 30 minutes (Google Cloud account, API key, Place IDs)
- **Development Time:** 2-3 hours (API endpoint, normalization, dashboard updates)
- **Testing Time:** 1 hour
- **Total Time:** 3.5-4.5 hours
- **Complexity:** Low-Medium
- **Dependencies:**
  - Google Cloud Platform account
  - Billing enabled (credit card)
  - Place IDs for all properties

## Alternative Approaches

### 1. Manual CSV Import
**Description:** Export reviews from Google Business Profile and import via CSV
**Pros:** No API costs, no rate limits, full control
**Cons:** Manual process, not scalable, no automation

### 2. Third-Party Review Aggregation
**Services:** ReviewTrackers, Birdeye, Podium, Grade.us
**Pros:** Aggregates multiple review platforms, built-in analytics
**Cons:** Monthly subscription costs ($50-500/month), additional complexity

### 3. Google My Business API
**Description:** Use official Google My Business API for business owners
**Pros:** No per-request costs, access to all reviews, includes review responses
**Cons:** Requires business ownership verification, OAuth authentication, more complex setup

### 4. Custom Web Scraping (Not Recommended)
**Description:** Scrape Google Maps review pages
**Pros:** No API costs
**Cons:** Violates Google Terms of Service, fragile to HTML changes, legal risks

## Implementation Plan (If Proceeding)

### Step 1: Google Cloud Setup
1. Visit https://console.cloud.google.com
2. Create new project: "flex-living-reviews"
3. Enable Places API (New)
4. Create credentials → API Key
5. Restrict API key:
   - API restrictions: Places API
   - Application restrictions: Add production domain
6. Copy API key

### Step 2: Find Place IDs
For each property, search on Google Maps and extract Place ID from URL or use Places API Search.

**Example Property Mapping:**
```typescript
const PROPERTY_PLACE_IDS = {
  '2b-n1-a-29-shoreditch-heights': 'ChIJdd4hrwug2ekRmSrV3Vo4...',
  '1b-s2-b-15-camden-square': 'ChIJCwQWWUwbdkgRTNKKqJZb...',
  'studio-n1-a-52-kings-cross': 'ChIJZxQwWDMbdkgR8fTNKwR5...',
  '2b-e1-b-23-brick-lane': 'ChIJTwQWWNwbdkgRAANKKvpN...',
  '1b-w1-c-18-soho-square': 'ChIJBxQwWEwbdkgRmmQKwjhQ...'
};
```

### Step 3: Environment Variables
Add to `.env`:
```env
GOOGLE_API_KEY=your_api_key_here
```

### Step 4: Create API Route
Create `/app/api/reviews/google/route.ts` with error handling and caching.

### Step 5: Update Database Schema (Optional)
Consider adding index on `channel` field for efficient filtering:
```prisma
model Review {
  // ... existing fields
  channel String

  @@index([channel])
}
```

### Step 6: Update Dashboard
Modify dashboard to:
- Fetch both Hostaway and Google reviews
- Show channel badge on each review
- Allow filtering by channel
- Display appropriate category data (empty for Google)

### Step 7: Testing Checklist
- [ ] API endpoint returns valid data
- [ ] Google reviews display in dashboard
- [ ] Channel filter includes "Google" option
- [ ] Public pages can show Google reviews when approved
- [ ] Rate limiting doesn't cause issues
- [ ] Error handling works when API is down

## Conclusion

Google Reviews integration is feasible and relatively straightforward to implement. The primary considerations are:

1. **Cost:** Minimal (under $15/month) with $200 free credit
2. **Time:** 3-4 hours of development
3. **Value:** Adds social proof from Google Maps users
4. **Limitation:** Only 5 reviews per property per request
5. **Requirement:** Google Cloud billing account

**Recommended Next Steps:**
1. Set up Google Cloud account with free trial
2. Obtain Place IDs for all 5 properties
3. Implement basic integration as proof of concept
4. Evaluate whether 5 reviews per property provides sufficient value
5. If valuable, productionize with proper error handling and caching

The integration is viable for Flex Living's current scale (5 properties) and adds diversified review sources to build trust with potential guests.
