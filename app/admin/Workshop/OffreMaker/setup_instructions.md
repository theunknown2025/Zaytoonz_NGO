# OffreMaker - Supabase Setup Instructions

Follow these instructions to set up the OffreMaker template system with your Supabase database.

## 1. Set up your Supabase environment variables

Ensure you have the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Create the templates table

Run the SQL script in `sql_setup.sql` in your Supabase SQL editor. This will:

1. Create the `offres_templates` table
2. Set up Row Level Security policies
3. Create necessary indexes for performance
4. Add triggers for automatically updating timestamps

## 3. Verify the table creation

After running the SQL, check that the `offres_templates` table exists in your Supabase dashboard.

## 4. Test the functionality

1. Create a new template in the OffreMaker tool
2. Verify it appears in the template list view
3. Try editing and deleting templates
4. Check that the templates are persisted if you reload the page

## Troubleshooting

- If templates aren't saving, check your browser console for errors
- Verify your Supabase credentials are correct
- Ensure your database permissions are set up correctly

---

The template system uses the following Supabase functions:

- `saveTemplate()` - Creates or updates a template
- `getTemplates()` - Retrieves all templates
- `deleteTemplate()` - Removes a template
- `getTemplateById()` - Gets a specific template by ID 