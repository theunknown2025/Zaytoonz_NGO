# Build Architecture Audit: Static vs Dynamic

## Executive Summary

**Recommendation: DYNAMIC BUILD (Server-Side Rendering)**

This application **MUST** be built as a **dynamic/server-rendered application**, NOT as a static export. The app requires runtime server capabilities, database access, and user-specific content.

---

## Analysis Results

### ✅ Current Configuration (Correct)

```javascript
// next.config.js
// NO 'output: export' - This is correct!
// App is configured for server-side rendering
```

### 🔍 Key Findings

#### 1. **API Routes (Critical)**
- **Count**: 30+ API routes
- **Status**: All require runtime execution
- **Examples**:
  - `/api/opportunities` - Fetches dynamic data from Supabase
  - `/api/admin/*` - Admin operations requiring authentication
  - `/api/ngo/*` - NGO-specific operations
  - `/api/seeker/*` - User-specific data
  - `/api/morchid` - AI chat functionality

**Impact**: Static export would eliminate ALL API routes. ❌

#### 2. **Authentication System**
- **Type**: Hybrid (Client + Server)
- **Client-side**: localStorage-based auth (`app/lib/auth.ts`)
- **Server-side**: Token-based auth in API routes (`app/lib/auth-utils.ts`)
- **Features**:
  - Email/password authentication
  - Google OAuth
  - Protected routes
  - User-specific content

**Impact**: Requires server-side session management. ❌

#### 3. **Data Fetching Patterns**

**Server Components** (Require SSR):
```typescript
// app/seeker/opportunities/[id]/page.tsx
export default async function OpportunityDetailPage({ params }) {
  const { data } = await supabase.from('opportunities')...
  // Fetches data at request time
}
```

**Client Components** (114 files with 'use client'):
- Most pages fetch data client-side using `useEffect` and `fetch`
- Real-time updates
- User-specific dashboards

**Impact**: Requires runtime database access. ❌

#### 4. **Database Operations**
- **Database**: Supabase (PostgreSQL)
- **Operations**: 
  - CRUD operations on opportunities
  - User profiles
  - Applications
  - Evaluations
  - Forms
  - Templates
- **Pattern**: All operations happen at runtime

**Impact**: Cannot be pre-rendered. ❌

#### 5. **Dynamic Content**
- User-specific dashboards
- Real-time opportunity listings
- Application forms (dynamic structure)
- Evaluation systems
- Admin panels
- Chat/AI features (Morchid)

**Impact**: Content changes per user and over time. ❌

#### 6. **Static Generation Attempts**

Only ONE page attempts static generation:
```typescript
// app/seeker/opportunities/[id]/form/page.tsx
export async function generateStaticParams() {
  // Tries to pre-generate form pages
}
```

**Issue**: This still requires runtime data fetching for form structure.

---

## Detailed Breakdown

### Pages That Require SSR/Dynamic Rendering

#### Admin Pages (All Dynamic)
- `/admin/*` - All admin pages require authentication and real-time data
- Admin dashboard, NGO management, talent management
- Workshop tools (FormMaker, EvaluationMaker, etc.)

#### NGO Pages (All Dynamic)
- `/ngo/dashboard` - User-specific dashboard
- `/ngo/opportunities/*` - Create/edit opportunities
- `/ngo/applications` - View applications
- `/ngo/profile` - User profile management

#### Seeker Pages (Mostly Dynamic)
- `/seeker/opportunities` - Real-time opportunity listings
- `/seeker/opportunities/[id]` - Dynamic opportunity details
- `/seeker/profile` - User-specific profile
- `/seeker/Morchid` - AI chat (requires runtime)

#### Public Pages (Could be Static, but...)
- `/` - Landing page (could be static, but uses dynamic data)
- `/auth/*` - Auth pages (could be static)

**Problem**: Even "public" pages fetch dynamic data (recent opportunities, etc.)

### API Routes Analysis

| Route Category | Count | Requires Runtime | Can be Static? |
|---------------|-------|-----------------|----------------|
| Admin APIs | 14 | ✅ Yes | ❌ No |
| NGO APIs | 6 | ✅ Yes | ❌ No |
| Seeker APIs | 2 | ✅ Yes | ❌ No |
| Opportunities APIs | 5 | ✅ Yes | ❌ No |
| Dashboard APIs | 5 | ✅ Yes | ❌ No |
| Other APIs | 8+ | ✅ Yes | ❌ No |

**Total**: 40+ API routes, ALL require runtime execution.

---

## Why Static Export Won't Work

### ❌ Static Export Limitations

1. **No API Routes**: Static export removes all `/api/*` routes
2. **No Server Components**: Cannot use async server components
3. **No Runtime Data**: Cannot fetch data at request time
4. **No Authentication**: Cannot verify tokens server-side
5. **No Database Access**: Cannot query Supabase at runtime
6. **No Dynamic Routes**: Limited dynamic routing capabilities

### ✅ Current Setup (Correct)

- **Server**: Node.js server required (using `server.js`)
- **Runtime**: Next.js server-side rendering
- **API Routes**: All functional
- **Database**: Runtime Supabase access
- **Authentication**: Server-side token validation

---

## Current Build Configuration

### ✅ Correct Settings

```javascript
// next.config.js
{
  // NO 'output: export' - Correct!
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Server-side rendering enabled
}
```

### ✅ Deployment Setup

```javascript
// server.js
const app = next({ 
  dev, 
  hostname, 
  port,
  basePath 
});
// Custom server for runtime execution
```

```javascript
// ecosystem.test.config.js
{
  script: 'server.js',  // Uses custom server
  // PM2 runs Node.js server
}
```

---

## Recommendations

### ✅ Keep Current Architecture (Dynamic/SSR)

**Reasons**:
1. ✅ All API routes work
2. ✅ Database access at runtime
3. ✅ User authentication works
4. ✅ Real-time data updates
5. ✅ Dynamic content per user
6. ✅ Admin functionality intact

### ❌ Do NOT Use Static Export

If you add `output: 'export'` to `next.config.js`:
- ❌ All API routes will be removed
- ❌ Database operations will fail
- ❌ Authentication will break
- ❌ Dynamic pages won't work
- ❌ Admin panel won't function

### 🔧 Optimization Opportunities

While keeping dynamic rendering, you can optimize:

1. **ISR (Incremental Static Regeneration)**:
   ```typescript
   export const revalidate = 3600; // Revalidate every hour
   ```
   - Use for pages that change infrequently
   - Example: Landing page, public opportunity listings

2. **Static Generation for Public Pages**:
   ```typescript
   // For truly static content
   export const dynamic = 'force-static';
   ```
   - Use sparingly, only for pages with no dynamic content

3. **Edge Runtime** (Future):
   - Consider Edge Functions for API routes
   - Faster response times
   - Lower server costs

---

## Conclusion

### ✅ **VERDICT: DYNAMIC BUILD (Current Setup is Correct)**

Your application **MUST** remain as a **dynamic/server-rendered** application because:

1. ✅ **40+ API routes** require runtime execution
2. ✅ **Database operations** happen at request time
3. ✅ **User authentication** requires server-side validation
4. ✅ **Dynamic content** changes per user and over time
5. ✅ **Real-time features** (chat, updates, etc.)

### Current Deployment Setup

Your current deployment is **correctly configured**:
- ✅ Using `server.js` for custom server
- ✅ PM2 for process management
- ✅ Nginx reverse proxy
- ✅ Runtime environment variables
- ✅ No static export configuration

### Action Items

1. ✅ **Keep** current dynamic build configuration
2. ✅ **Continue** using `server.js` and PM2
3. ✅ **Maintain** API routes as dynamic
4. ⚠️ **Consider** ISR for specific pages (optional optimization)
5. ❌ **Do NOT** add `output: 'export'` to `next.config.js`

---

## Technical Details

### Build Output Analysis

When you run `npm run build`, you should see:

```
Route (app)                                                            Size     First Load JS
├ ○ /                                                                  Static page
├ λ /api/admin/evaluation-templates                                    Dynamic API route
├ λ /api/opportunities                                                  Dynamic API route
├ λ /seeker/opportunities/[id]                                         Dynamic page
└ ○ /auth/signin                                                        Static page
```

**Legend**:
- `○` = Static (pre-rendered)
- `λ` = Dynamic (server-rendered)
- `●` = SSG (Static Site Generation)

**Your app should have mostly `λ` (dynamic) routes**, which is correct!

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Current architecture is correct - Keep dynamic build

