# Database Migrations

This folder contains SQL migration files for the Zaytoonz NGO database.

## Running Migrations

### Step 1: Add Opportunity Type Column

Run the SQL commands in `migrations/add_opportunity_type.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/add_opportunity_type.sql`
4. Click "Run" to execute the migration

This migration will:
- Add an `opportunity_type` column to the `opportunities` table
- Add a constraint to ensure only valid values ('job', 'funding', 'training') are allowed
- Create an index for better query performance
- Add documentation comments

### Verification

After running the migration, you can verify it worked by running:

```sql
-- Check if the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'opportunities' AND column_name = 'opportunity_type';

-- Check the constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'opportunities_type_check';

-- Check the index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' AND indexname = 'idx_opportunities_type';
```

## Opportunity Service

The `app/ngo/opportunities/services/opportunityService.ts` file provides a comprehensive API for managing opportunities:

### Available Functions

- `createInitialOpportunity(opportunityId, opportunityType)` - Create a new opportunity with type
- `updateOpportunity(opportunityId, updateData)` - Update opportunity data
- `updateOpportunityType(opportunityId, opportunityType)` - Update only the opportunity type
- `getOpportunityById(opportunityId)` - Fetch a specific opportunity
- `getOpportunities(opportunityType?)` - Fetch all opportunities with optional type filtering
- `deleteOpportunity(opportunityId)` - Delete an opportunity

### Types

- `OpportunityType`: 'job' | 'funding' | 'training'
- `OpportunityData`: Complete opportunity data interface
- `CreateOpportunityResponse`: Response from create operations
- `UpdateOpportunityResponse`: Response from update operations

### Usage Example

```typescript
import { createInitialOpportunity, OpportunityType } from '../services/opportunityService';

const result = await createInitialOpportunity('uuid-here', 'job' as OpportunityType);
if (result.success) {
  console.log('Opportunity created:', result.opportunity);
} else {
  console.error('Error:', result.error);
}
```

## Database Schema Changes

### Before Migration
```sql
create table public.opportunities (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint opportunities_pkey primary key (id)
);
```

### After Migration
```sql
create table public.opportunities (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  opportunity_type text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint opportunities_pkey primary key (id),
  constraint opportunities_type_check check (opportunity_type IN ('job', 'funding', 'training'))
);
``` 