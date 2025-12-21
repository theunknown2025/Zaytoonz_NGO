# Google OAuth Setup Guide for Zaytoonz NGO

This guide will help you set up Google OAuth authentication for your Zaytoonz NGO application using Supabase.

## Prerequisites

- A Supabase project
- A Google Cloud Console project
- Access to your Supabase dashboard

## Step 1: Configure Google Cloud Console

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Zaytoonz NGO"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email addresses for testing)

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the name: "Zaytoonz NGO Web Client"
5. Add authorized redirect URIs:
   - `https://uroirdudxkfppocqcorm.supabase.co/auth/v1/callback`
   - `https://zaytoonz-ong.netlify.app/auth/callback` (for production)
   - `http://localhost:3000/auth/callback` (for development)
6. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider
1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Enable"
4. Enter the Google Client ID and Client Secret from Step 1.3
5. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

### 2.2 Configure Site URL
1. In Supabase dashboard, go to "Authentication" > "Settings"
2. Set the Site URL to: `https://zaytoonz-ong.netlify.app`
3. Add additional redirect URLs if needed:
   - `https://zaytoonz-ong.netlify.app/auth/callback` (for production)
   - `http://localhost:3000/auth/callback` (for development)

## Step 3: Update Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
```

## Step 4: Database Schema Updates

Make sure your `users` table has the following columns:

```sql
-- Add auth_provider column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50);

-- Update existing users to have 'email' as auth_provider
UPDATE users SET auth_provider = 'email' WHERE auth_provider IS NULL;
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/auth/signin` or `/auth/signup`
3. Click "Sign in with Google" or "Sign up with Google"
4. Complete the Google OAuth flow
5. Verify that you're redirected to the appropriate dashboard

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check that the URI in Supabase settings is correct

2. **"OAuth consent screen not configured"**
   - Complete the OAuth consent screen setup in Google Cloud Console
   - Add your email as a test user

3. **"Client ID not found"**
   - Verify the Client ID and Client Secret are correctly entered in Supabase
   - Check that the Google Cloud project is active

4. **"Redirect URI mismatch"**
   - Ensure the redirect URI in both Google Cloud Console and Supabase match
   - Include both production and development URLs

### Debug Steps

1. Check browser console for errors
2. Verify Supabase logs in the dashboard
3. Test with a different browser or incognito mode
4. Ensure all environment variables are set correctly

## Security Considerations

1. **Never commit Client Secret to version control**
2. **Use environment variables for sensitive data**
3. **Regularly rotate OAuth credentials**
4. **Monitor OAuth usage in Google Cloud Console**
5. **Implement proper error handling**

## Production Deployment

1. Update redirect URIs to use your production domain
2. Remove development URLs from Google Cloud Console
3. Update Supabase site URL to production domain
4. Test the complete OAuth flow in production
5. Monitor authentication logs

## Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/social-login/auth-google
2. Review Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
3. Check Supabase community forums
4. Review application logs for detailed error messages
