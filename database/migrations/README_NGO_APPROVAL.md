# NGO Approval System Migration

This migration adds approval status fields to the NGO tables to implement the approval workflow.

## Running the Migration

### Step 1: Run the NGO Approval Migration

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/add_ngo_approval_status.sql`
4. Click "Run" to execute the migration

This migration will:
- Add `approval_status` column to `ngo_profile` table (default: 'pending')
- Add `admin_notes`, `approved_at`, `approved_by` columns to `ngo_profile` table
- Add `approval_status` column to `ngo_details` table (default: 'pending')
- Add `admin_notes`, `approved_at`, `approved_by` columns to `ngo_details` table
- Create indexes for better query performance
- Add documentation comments

### Step 2: Verify the Migration

After running the migration, you can verify it worked by running:

```sql
-- Check if the columns were added to ngo_profile
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ngo_profile' 
AND column_name IN ('approval_status', 'admin_notes', 'approved_at', 'approved_by');

-- Check if the columns were added to ngo_details
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ngo_details' 
AND column_name IN ('approval_status', 'admin_notes', 'approved_at', 'approved_by');

-- Check the constraints
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%approval_status%';

-- Check the indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE indexname LIKE '%approval_status%';
```

### Expected Results

You should see:
- `approval_status` column with default value 'pending'
- `admin_notes` column (text, nullable)
- `approved_at` column (timestamp with time zone, nullable)
- `approved_by` column (uuid, nullable, references users(id))
- Check constraint ensuring approval_status is one of: 'pending', 'approved', 'rejected'
- Indexes for faster approval status queries

## Testing the Approval System

### 1. Create a Test NGO Account
1. Sign up as an NGO user
2. Complete the profile
3. Verify the approval status is 'pending'

### 2. Test Admin Panel
1. Sign in as an admin user
2. Go to `/admin/NGOManagement`
3. Verify you can see the NGO with 'pending' status
4. Test the approve/reject functionality

### 3. Test NGO Dashboard Access
1. Sign in as the NGO user
2. Verify they can only access the profile page
3. After admin approval, verify they can access the full dashboard

## Troubleshooting

### Common Issues

1. **Migration fails with "column already exists"**
   - The columns might already exist. Check with the verification queries above.
   - The migration uses `ADD COLUMN IF NOT EXISTS` so it should be safe to run multiple times.

2. **Admin can't see NGOs**
   - Verify the admin user has `user_type = 'Admin'` in the users table
   - Check the browser console for authentication errors

3. **NGO can't check approval status**
   - Verify the NGO user has a record in the `ngo_profile` table
   - Check that the API endpoint `/api/ngo/approval-status` is working

### Debug Queries

```sql
-- Check all NGO profiles and their approval status
SELECT 
  np.id,
  np.name,
  np.email,
  np.approval_status,
  np.admin_notes,
  np.approved_at,
  np.created_at
FROM ngo_profile np
ORDER BY np.created_at DESC;

-- Check admin users
SELECT 
  id,
  full_name,
  email,
  user_type
FROM users 
WHERE user_type = 'Admin';

-- Check NGO details
SELECT 
  nd.user_id,
  nd.approval_status,
  nd.admin_notes,
  nd.approved_at
FROM ngo_details nd
ORDER BY nd.approved_at DESC NULLS FIRST;
```

## API Endpoints

After the migration, these API endpoints will be available:

- `GET /api/ngo/approval-status` - Get current NGO approval status
- `GET /api/admin/ngos` - Get all NGOs (admin only)
- `PATCH /api/admin/ngos/[id]/approval` - Approve/reject NGO (admin only)

## Workflow

1. **NGO Signup** → User creates account as NGO
2. **Profile Completion** → NGO fills out profile information
3. **Admin Review** → Admin sees NGO in pending list
4. **Admin Decision** → Admin approves or rejects with notes
5. **Access Control** → Approved NGOs get full dashboard access
