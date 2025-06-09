# Setting up Supabase for Zaytoonz NGO

This guide will help you set up the necessary database tables in Supabase for the Zaytoonz NGO application.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.io](https://supabase.io) and sign up for an account
2. Create a new project and give it a name
3. Once the project is created, note down the URL and Anon Key from the API settings page

## Step 2: Run the SQL Commands

1. In your Supabase project, navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of the `supabase-schema.sql` file into the editor
4. Run the query to create all the necessary tables and security policies

## Step 3: Update Application Configuration

1. Open `app/lib/supabase.ts`
2. Replace the `supabaseUrl` and `supabaseAnonKey` values with your own:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## Step 4: Testing the Setup

To test if your Supabase setup is working correctly:

1. Run the application locally with `npm run dev`
2. Navigate to the sign-up page
3. Create a test account
4. Check your Supabase dashboard to verify that the new user was added to the `users` table
5. Also verify that a record was created in either `ngo_details` or `personne_details` depending on the account type

## Security Notes

- The password hashing in this demo is simplistic. In a production environment, you should use a proper password hashing function like bcrypt
- The Row Level Security (RLS) policies in the schema ensure that users can only access their own data
- For a production application, consider implementing additional security measures like rate limiting and CORS configuration 