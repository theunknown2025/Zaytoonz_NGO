# NGO Management

This folder contains the restructured NGO management system that follows the same pattern as the Talents folder.

## Structure

- **`supabaseService.ts`** - Contains all Supabase database operations for NGO profiles
- **`FetchNGOs.tsx`** - Custom hook that handles data fetching and state management
- **`DisplayNGOs.tsx`** - UI component that displays the NGO data and handles user interactions
- **`page.tsx`** - Main page component that integrates all the pieces together

## Features

### Data Fetching
- Fetches NGO profiles from the `ngo_profile` table
- Includes user information from the `users` table
- Calculates statistics for each NGO (opportunities, applications, etc.)
- Supports pagination and search functionality

### Statistics
- Total NGOs count
- Pending approval count
- Approved count
- Rejected count
- Opportunities and applications per NGO

### Search and Filtering
- Search by NGO name, email, or legal representative name
- Filter by approval status (pending, approved, rejected)
- Real-time search with pagination

### Approval Management
- Approve/reject NGOs with optional notes
- Update approval status in real-time
- Visual status indicators

## Database Tables Used

- `ngo_profile` - Main NGO profile data
- `users` - User information (linked via user_id)
- `opportunity_description` - Opportunities created by NGOs
- `opportunity_applications` - Applications for opportunities

## API Endpoints

- `GET /api/admin/ngos` - Fetch all NGO profiles with statistics
- `PATCH /api/admin/ngos/[id]/approval` - Update NGO approval status

## Key Differences from Previous Version

1. **No Authentication Required** - Removed Supabase auth requirements as requested
2. **Correct Table Usage** - Now uses `ngo_profile` table instead of `ngo_details`
3. **Modular Structure** - Separated concerns into different files following Talents pattern
4. **Direct Database Access** - Uses Supabase client directly instead of API routes for data fetching
5. **Better Error Handling** - Improved error handling and user feedback
6. **Fixed Relationship Ambiguity** - Specified exact foreign key relationship (`user:users!user_id`) to avoid multiple relationship conflicts

## Usage

The system automatically loads NGO data when the page loads and provides:
- Statistics cards showing overview
- Searchable and filterable NGO table
- Approval actions for pending NGOs
- Pagination for large datasets

All data is fetched directly from the database using the Supabase client, ensuring real-time updates and better performance.
