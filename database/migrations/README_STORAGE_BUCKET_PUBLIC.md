# Making Supabase Storage Bucket Public

## Issue
Images are uploaded successfully but fail to load with error: "Failed to load image" or 403 Forbidden.

## Solution: Make the Bucket Public

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Find the bucket: **`ngo-profile-pictures`**
4. Click on the bucket name
5. Go to **Settings** tab
6. Toggle **"Public bucket"** to **ON**
7. Save the changes

### Option 2: Using SQL (Alternative)

If you prefer using SQL, run this in your Supabase SQL Editor:

```sql
-- Make the bucket public by creating a policy
CREATE POLICY "Public Access for ngo-profile-pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'ngo-profile-pictures');
```

### Option 3: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Create the policy
supabase db execute "
CREATE POLICY \"Public Access for ngo-profile-pictures\"
ON storage.objects FOR SELECT
USING (bucket_id = 'ngo-profile-pictures');
"
```

## Verify the Fix

After making the bucket public:

1. Try uploading an image again
2. The image should now display correctly
3. You can test the URL directly in a new browser tab - it should load the image

## Additional Notes

- **Security**: Making a bucket public means anyone with the URL can access the files. This is fine for profile images, banners, and logos that are meant to be public.
- **Alternative**: If you need private files, use signed URLs instead of public URLs (requires code changes).
- **Bucket Name**: Make sure the bucket name matches exactly: `ngo-profile-pictures`

## Troubleshooting

If images still don't load after making the bucket public:

1. **Check bucket name**: Ensure it's exactly `ngo-profile-pictures` (case-sensitive)
2. **Clear browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. **Check CORS settings**: In Supabase Dashboard → Storage → Settings → CORS
4. **Verify URL format**: The URL should look like:
   ```
   https://[project-ref].supabase.co/storage/v1/object/public/ngo-profile-pictures/[path]
   ```
5. **Check browser console**: Look for any CORS or network errors
