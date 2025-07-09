# Scraped Opportunities Feature

This feature allows the Zaytoonz scraper to save scraped opportunities to dedicated database tables, separate from user-created opportunities.

## Database Setup

### Step 1: Run the Migration

Execute the SQL migration in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/migrations/create_scraped_opportunities.sql`
4. Click "Run" to execute the migration

This will create:
- `scraped_opportunities` - Main table for scraped opportunities
- `scraped_opportunity_details` - Detailed information for each opportunity
- `scraped_opportunities_complete` - View for easy querying
- Proper indexes and triggers for performance

### Step 2: Verify Setup

Check if the tables were created successfully:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'scraped_opportunities%';

-- Check the view
SELECT * FROM scraped_opportunities_complete LIMIT 1;
```

### Step 3: Fix Ordering Issues (If Needed)

If you notice that newer opportunities appear last instead of first, run this fix:

```sql
-- Run this SQL to fix the ordering issue
CREATE OR REPLACE VIEW scraped_opportunities_complete AS
SELECT 
    so.id, so.title, so.opportunity_type, so.source_url, so.status,
    so.scraped_at, so.created_at, so.updated_at,
    sod.description, sod.location, sod.company, sod.hours, sod.deadline,
    sod.requirements, sod.benefits, sod.salary_range, sod.contact_info,
    sod.tags, sod.metadata, so.scraper_config
FROM scraped_opportunities so
LEFT JOIN scraped_opportunity_details sod ON so.id = sod.scraped_opportunity_id;
```

Or run the migration file:
```bash
# In your Supabase SQL Editor
\i database/migrations/fix_scraped_opportunities_view_ordering.sql
```

## Features

### Separate Storage
- Scraped opportunities are stored in dedicated tables
- No conflicts with user-created opportunities
- No user_id constraints issues

### Complete Field Mapping
- Automatically detects opportunity type (job/funding/training)
- Maps scraped fields to appropriate database columns
- Stores additional metadata in JSON format
- Preserves original scraped data for reference

### Admin Management
- API endpoints for viewing scraped opportunities
- Status management (active/inactive/archived)
- Filtering by type and status
- Pagination support

## API Endpoints

### GET /api/admin/scraped-opportunities
Retrieve scraped opportunities with filtering and pagination.

**Query Parameters:**
- `type` - Filter by opportunity type (job, funding, training)
- `status` - Filter by status (active, inactive, archived) - default: active
- `limit` - Number of results per page - default: 50
- `offset` - Pagination offset - default: 0

**Response:**
```json
{
  "opportunities": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### PATCH /api/admin/scraped-opportunities
Update opportunity status.

**Body:**
```json
{
  "id": "uuid",
  "status": "active|inactive|archived"
}
```

### DELETE /api/admin/scraped-opportunities?id=uuid
Delete a scraped opportunity (cascades to details).

## Database Schema

### scraped_opportunities
- `id` - UUID primary key
- `title` - Opportunity title
- `opportunity_type` - Type (job/funding/training)
- `source_url` - Original URL scraped from
- `scraper_config` - JSONB with scraper configuration
- `status` - Current status (active/inactive/archived)
- `scraped_at` - When it was scraped
- `created_at` / `updated_at` - Timestamps

### scraped_opportunity_details
- `id` - UUID primary key
- `scraped_opportunity_id` - Foreign key to main table
- `description` - Full description
- `location` - Job/opportunity location
- `company` - Company/organization name
- `hours` - Working hours/duration
- `deadline` - Application deadline
- `requirements` - Job requirements
- `benefits` - Benefits offered
- `salary_range` - Salary information
- `contact_info` - Contact information
- `tags` - Array of tags
- `metadata` - JSONB for additional fields
- `created_at` / `updated_at` - Timestamps

## Benefits

1. **No Conflicts**: Scraped opportunities don't interfere with user-created ones
2. **Rich Metadata**: All scraped fields are preserved
3. **Type Detection**: Automatically categorizes opportunities
4. **Easy Management**: Admin APIs for viewing and managing
5. **Performance**: Proper indexing for fast queries
6. **Flexibility**: Metadata field stores any additional scraped data

## Usage in Scraper

The scraper automatically:
1. Validates scraped items based on required fields
2. Determines opportunity type from URL and content
3. Maps fields to appropriate database columns
4. Saves to the new dedicated tables
5. Provides visual feedback in the UI

No changes needed in the scraper UI - it now uses the new tables automatically! 