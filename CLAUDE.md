# Flex Living Reviews Dashboard - Project Instructions

## Project Context
This is the **Flex Living Reviews Dashboard**, a property management tool for assessing guest reviews. This is a developer assessment project with specific requirements and evaluation criteria.

**Important**: When working on this project, always prioritize the core requirements and maintain code quality standards outlined below.

## Core Requirements (Must Implement)
1. **Hostaway API Integration** (mocked with JSON data)
   - Endpoint: `GET /api/reviews/hostaway` (CRITICAL - will be tested directly)
   - Must fetch and normalize review data
   - Parse by listing, review type, channel, and date

2. **Manager Dashboard**
   - View per-property performance
   - Filter/sort by rating, category, channel, time
   - Detect trends and recurring issues
   - **Select reviews for public display** (core feature)

3. **Review Display Page**
   - Replicate Flex Living property layout
   - Show only approved/selected reviews
   - Design consistency with Flex Living website

4. **Google Reviews Exploration**
   - Research Google Places API feasibility
   - Document findings (implement if feasible)

## Tech Stack (Already Decided)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite (dev) / PostgreSQL (prod)
- **Testing**: Jest + React Testing Library

## Project Structure
```
flex-living-dashboard/
├── app/
│   ├── api/reviews/hostaway/route.ts  # ⭐ CRITICAL - Must implement
│   ├── dashboard/page.tsx             # Manager dashboard
│   └── properties/[id]/page.tsx       # Public review display
├── lib/mock-reviews.json              # Mock data
├── prisma/schema.prisma
├── types/index.ts
└── __tests__/                         # API and component tests
```

## Critical Implementation Rules

### 1. API Route Priority
- The `/api/reviews/hostaway` endpoint is **MANDATORY** and will be tested
- Must return normalized data structure:
  ```json
  {
    "status": "success",
    "result": [/* normalized reviews */]
  }
  ```
- Use mock data when Hostaway API returns empty results

### 2. Database Schema (Prisma)
```prisma
model Property {
  id      String   @id @default(cuid())
  name    String
  reviews Review[]
}

model Review {
  id               String   @id @default(cuid())
  propertyId       String
  property         Property @relation(fields: [propertyId], references: [id])
  guestName        String
  rating           Float?
  publicReview     String
  channel          String
  reviewType       String
  status           String
  displayOnWebsite Boolean  @default(false)  # Manager selection
  categories       Json
  submittedAt      DateTime
}
```

### 3. Code Quality Standards
- **Clean, readable code** - clarity over cleverness
- **TypeScript strict mode** - proper type definitions
- **Minimal dependencies** - avoid over-engineering
- **Component-based architecture** - reusable UI components
- **Error handling** - graceful fallbacks for API failures

### 4. UX/UI Principles
- **Clean and intuitive** design
- **Modern** but not overly complex
- **Responsive** layout (mobile-friendly)
- **Product management thinking** - prioritize usability
- **Design consistency** with Flex Living branding

### 5. Testing Requirements
- Test the `/api/reviews/hostaway` endpoint thoroughly
- Test dashboard filtering and sorting logic
- Test review selection functionality
- Coverage for data normalization

## What NOT to Include
- ❌ Authentication/authorization systems
- ❌ Real-time notifications
- ❌ AI/ML analysis features
- ❌ Complex state management (Redux/Zustand)
- ❌ Advanced analytics dashboards
- ❌ Features not mentioned in requirements

## Development Workflow

### When Creating Components
1. Start with TypeScript interfaces/types
2. Build minimal functional version first
3. Add styling with Tailwind CSS
4. Test with realistic mock data
5. Ensure responsive design

### When Implementing Features
1. Reference requirements document
2. Create clear, descriptive variable/function names
3. Add comments for complex logic
4. Handle edge cases (empty data, errors)
5. Test with various filter/sort combinations

### When Writing API Routes
1. Validate input parameters
2. Handle errors gracefully
3. Return consistent response format
4. Log important operations
5. Use environment variables for credentials

## Environment Variables
```env
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
DATABASE_URL="file:./dev.db"
```

## Evaluation Criteria (What Reviewers Look For)
1. **JSON data handling** - How well you normalize/parse API responses
2. **Code clarity** - Readable, maintainable code structure
3. **UX/UI quality** - Intuitive, well-designed interface
4. **Dashboard insights** - Useful filtering, sorting, trend detection
5. **Problem-solving** - How you handle ambiguous requirements

## Documentation Requirements
Create 1-2 page documentation covering:
- Tech stack used (and why)
- Key design and logic decisions
- API behavior and data flow
- Google Reviews research findings
- Setup instructions

## Code Style Preferences
- Use functional components with hooks
- Prefer server components where possible (Next.js App Router)
- Use async/await over promises
- Destructure props and parameters
- Keep functions small and focused
- Use early returns to reduce nesting

## Naming Conventions
- Components: PascalCase (e.g., `ReviewCard.tsx`)
- Utilities: camelCase (e.g., `normalizeReviewData.ts`)
- Types/Interfaces: PascalCase (e.g., `Review`, `HostawayReview`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- API routes: kebab-case folders (e.g., `reviews/hostaway`)

## Common Patterns to Use

### Data Normalization
```typescript
// Transform Hostaway API format to internal format
function normalizeHostawayReview(raw: HostawayReview): Review {
  return {
    id: raw.id.toString(),
    guestName: raw.guestName,
    rating: calculateAverageRating(raw.reviewCategory),
    publicReview: raw.publicReview,
    channel: 'hostaway',
    reviewType: raw.type,
    status: raw.status,
    categories: raw.reviewCategory,
    submittedAt: new Date(raw.submittedAt),
    displayOnWebsite: false
  };
}
```

### Error Handling
```typescript
try {
  const data = await fetchHostawayReviews();
  return Response.json({ status: 'success', result: data });
} catch (error) {
  console.error('Hostaway API error:', error);
  // Fallback to mock data
  return Response.json({ status: 'success', result: mockData });
}
```

## Quick Reference Commands
```bash
# Development
npm run dev

# Testing
npm test
npm run test:watch

# Database
npx prisma migrate dev
npx prisma studio

# Build
npm run build
npm start
```

## Key Files to Focus On
1. `app/api/reviews/hostaway/route.ts` - **CRITICAL** endpoint
2. `app/dashboard/page.tsx` - Main dashboard UI
3. `app/properties/[id]/page.tsx` - Public review display
4. `prisma/schema.prisma` - Database models
5. `types/index.ts` - TypeScript definitions
6. `lib/mock-reviews.json` - Test data

## When Asked to Implement Features
- Always check if it aligns with project requirements
- Prioritize core features over nice-to-haves
- Think from a product manager perspective
- Focus on real-world usability
- Keep it simple and maintainable

## When Debugging
1. Check API endpoint responses first
2. Verify data normalization logic
3. Test with edge cases (empty arrays, null values)
4. Check Prisma schema matches data structure
5. Validate TypeScript types are correct

## Success Criteria
✅ `/api/reviews/hostaway` returns normalized data
✅ Dashboard filters and sorts reviews correctly
✅ Managers can select reviews for public display
✅ Public page shows only approved reviews
✅ Code is clean and well-structured
✅ UI is intuitive and modern
✅ Documentation explains key decisions
✅ Tests cover critical functionality
