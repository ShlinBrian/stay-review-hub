Flex Living Reviews Dashboard - Technical Specification
Project Goal
According to PDF requirements, build a reviews dashboard with three core features:

Hostaway API integration (using mock data)
Manager dashboard
Public review display page
Google Reviews exploration (research only)

Tech Stack (Minimal Setup)
Frontend & Backend

Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS
Database: SQLite (development) / PostgreSQL (production)
ORM: Prisma

Required Packages
json{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "@prisma/client": "latest",
    "typescript": "latest",
    "tailwindcss": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "@types/react": "latest",
    "@types/node": "latest",
    "@testing-library/react": "latest",
    "@testing-library/jest-dom": "latest",
    "jest": "latest",
    "jest-environment-jsdom": "latest"
  }
}
Project Structure (Minimal)
flex-living-dashboard/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── hostaway/
│   │           └── route.ts  # ⭐ MUST implement - will be tested
│   ├── dashboard/
│   │   └── page.tsx          # Manager dashboard
│   └── properties/
│       └── [id]/
│           └── page.tsx      # Public review display
├── lib/
│   └── mock-reviews.json    # Mock data
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── __tests__/
│   ├── api/
│   │   └── reviews.test.ts  # API endpoint tests
│   └── dashboard.test.tsx   # Dashboard component tests
└── jest.config.js
Database Schema (Prisma)
prismamodel Property {
  id         String   @id @default(cuid())
  name       String
  reviews    Review[]
}

model Review {
  id               String   @id @default(cuid())
  propertyId       String
  property         Property @relation(fields: [propertyId], references: [id])
  guestName        String
  rating           Float?
  publicReview     String
  channel          String   // Source: airbnb, booking, etc.
  reviewType       String   // guest-to-host or host-to-guest
  status           String   // published
  displayOnWebsite Boolean  @default(false) // Manager selects for display
  categories       Json     // Category ratings
  submittedAt      DateTime
}
Core Implementation
1. Hostaway API Route (/api/reviews/hostaway/route.ts)
⭐ This endpoint MUST be implemented and will be tested
typescript// Required response structure
export async function GET() {
  // 1. Try calling Hostaway API (will be empty)
  // 2. Use provided mock data
  // 3. Normalize data format
  // 4. Return structured, usable data
  
  return Response.json({
    status: 'success',
    result: normalizedReviews
  });
}
Environment Variables:
envHOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
2. Manager Dashboard (/dashboard)
Required Features:

Display per-property performance
Filter by: rating, category, channel, time
Sorting functionality
Identify trends or recurring issues
Select reviews for website display (core feature)

UI Components:

Property list/cards
Review table (filterable/sortable)
Checkboxes (select for website display)
Simple trend charts

3. Public Review Display (/properties/[id])
Required Features:

Replicate Flex Living website property layout
Display only manager-approved reviews
Maintain design consistency

4. Google Reviews Exploration
Document findings:

Whether integration via Places API is feasible
If feasible, implement basic integration
If not, explain why

Mock Data Structure
json{
  "reviews": [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "rating": null,
      "publicReview": "Shane and family are wonderful! Would definitely host again :)",
      "reviewCategory": [
        {"category": "cleanliness", "rating": 10},
        {"category": "communication", "rating": 10},
        {"category": "respect_house_rules", "rating": 10}
      ],
      "submittedAt": "2020-08-21 22:45:14",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights"
    }
  ]
}
Testing Strategy
1. API Endpoint Tests (__tests__/api/reviews.test.ts)
typescript// Test /api/reviews/hostaway endpoint
describe('/api/reviews/hostaway', () => {
  it('should return normalized review data', async () => {
    const response = await fetch('/api/reviews/hostaway');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(Array.isArray(data.result)).toBe(true);
  });

  it('should handle mock data correctly', async () => {
    // Test data normalization
  });

  it('should include required fields', async () => {
    // Test response structure
  });
});
2. Dashboard Function Tests (__tests__/dashboard.test.tsx)
typescriptdescribe('Manager Dashboard', () => {
  it('should display property list', () => {});
  it('should filter reviews', () => {});
  it('should sort reviews', () => {});
  it('should select reviews for display', () => {});
});
3. Jest Configuration (jest.config.js)
javascriptconst nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
4. Package.json Scripts
json{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
Development Steps
bash# 1. Initialize project
npx create-next-app@latest flex-living-dashboard --typescript --tailwind --app

# 2. Install Prisma
npm install @prisma/client prisma

# 3. Install testing packages
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# 4. Setup database
npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init

# 5. Start development
npm run dev

# 6. Run tests
npm test
Deliverables Checklist

 Source code (frontend and backend)
 Local setup instructions
 /api/reviews/hostaway endpoint working and returning structured data
 Manager dashboard: can filter, sort, and select reviews
 Public display page: shows only approved reviews
 1-2 page documentation including:

 Tech stack used
 Key design decisions
 API behaviors
 Google Reviews findings



Documentation Template (README.md)
markdown# Flex Living Reviews Dashboard

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Prisma with SQLite

## Setup Instructions
1. npm install
2. Configure .env file
3. npx prisma migrate dev
4. npm run dev

## API Behaviors
- `/api/reviews/hostaway`: Fetches and normalizes Hostaway reviews
- Uses mock data as sandbox has no data

## Design Decisions
- Chose Next.js for API routes and SSR capabilities
- SQLite for simple local development
- UI kept clean and intuitive

## Google Reviews Findings
- [Explain feasibility and reasoning]
Important Notes

Don't over-engineer: Avoid authentication, real-time notifications, AI analysis, or other features not in PDF
Focus on core: API integration, dashboard, display page
Keep it simple: Use basic HTML/CSS, no complex UI libraries needed
Think like a product manager: Practical features over technical showcase

Evaluation Focus

Real-world JSON data handling and normalization ✓
Code clarity and structure ✓
UX/UI design quality and decision-making ✓
Dashboard feature insightfulness ✓
Problem-solving for undefined requirements ✓