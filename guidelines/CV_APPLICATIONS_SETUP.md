# CV Display in Applications - Setup Instructions

This feature allows NGOs to view the CVs that applicants have included with their opportunity applications.

## Database Migration Required

Before using this feature, you need to run the database migration to add CV fields to the `opportunity_applications` table.

### Step 1: Run the Migration

Execute the SQL migration file in your Supabase database:

```sql
-- Add CV fields to opportunity_applications table
ALTER TABLE opportunity_applications 
ADD COLUMN IF NOT EXISTS selected_cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS selected_cv_name TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_cv_id ON opportunity_applications(selected_cv_id);

-- Add comment to document the purpose
COMMENT ON COLUMN opportunity_applications.selected_cv_id IS 'Reference to the CV selected by the applicant for this application';
COMMENT ON COLUMN opportunity_applications.selected_cv_name IS 'Name of the CV at the time of application submission (for historical reference)';
```

### Step 2: Verify the Migration

Check that the columns were added successfully:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'opportunity_applications' 
AND column_name IN ('selected_cv_id', 'selected_cv_name');
```

## Features Included

### 1. CV Selection in Applications
- When applying for opportunities, seekers can now select a CV to include
- The selected CV ID and name are stored with the application

### 2. CV Display in NGO Applications Page
- NGOs can see which applications include CVs (indicated by a blue "CV" badge)
- Full CV details are displayed in the application review section
- CV information includes:
  - Personal information
  - Professional summary
  - Work experience (up to 3 most recent)
  - Education (up to 2 most recent)
  - Skills (up to 8, with overflow indicator)
  - Languages
  - Certificates (up to 3 most recent)

### 3. API Endpoints
- `GET /api/cvs/[id]` - Fetch complete CV details by ID
- Updated application APIs to include CV information

## File Changes Made

### Frontend Changes
1. **app/seeker/opportunities/[id]/OpportunityDetailClient.tsx**
   - Modified form submission to include selected CV information

2. **app/ngo/applications/page.tsx**
   - Added CV display functionality
   - Added CV badge indicators
   - Added state management for CV details

### Backend Changes
1. **app/api/opportunities/applications/route.ts**
   - Updated to handle CV information in application submissions

2. **app/api/ngo/applications/route.ts**
   - Updated to fetch CV information with applications

3. **app/api/cvs/[id]/route.ts** (New)
   - API endpoint to fetch complete CV details

### Database Changes
1. **database_migrations/add_cv_to_applications.sql** (New)
   - Migration to add CV fields to opportunity_applications table

## Usage

### For Seekers
1. When applying for an opportunity, select a CV from the "Include CV" section
2. The selected CV will be submitted with the application

### For NGOs
1. Go to the Applications page (`/ngo/applications`)
2. Expand an opportunity to view applications
3. Applications with CVs will show a blue "CV" badge
4. Expand an application to view the full CV details
5. Click "Load CV Details" to fetch complete CV information

## Notes

- CV information is stored as a reference (ID) and a snapshot (name) for historical purposes
- If a CV is deleted after application submission, the reference will be null but the name will remain
- CV details are loaded on-demand to improve page performance
- The CV display is responsive and includes scrollable content for long CVs

## Troubleshooting

### CV Not Displaying
1. Check that the database migration was applied successfully
2. Verify that the CV exists in the database
3. Check browser console for API errors

### Performance Issues
1. CV details are loaded on-demand to avoid performance issues
2. Consider implementing pagination for applications with many CVs
3. Monitor database query performance with the new indexes 