# Database Setup Guide for VPS Supabase

This guide will help you set up your database schema on your VPS Supabase instance at `http://195.35.28.149:8000`.

## 📋 Prerequisites

- SSH access to your VPS (195.35.28.149)
- PostgreSQL client installed on your VPS
- Supabase running on port 8000

---

## 🚀 Method 1: Using Supabase SQL Editor (Recommended for Beginners)

### Step 1: Access Supabase Dashboard

1. Open your browser and go to: `http://195.35.28.149:8000`
2. Log in to your Supabase dashboard
3. Navigate to **SQL Editor** from the left sidebar

### Step 2: Run the Database Schema

1. Click **"New Query"** button
2. Open the file `complete_database_schema.sql` from your local machine
3. **Copy the entire contents** of the file
4. **Paste** into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 3: Run Indexes and Sequences

1. Create a **new query**
2. Open `database_indexes_and_sequences.sql`
3. Copy and paste the contents
4. Click **"Run"**

### Step 4: Run RLS Policies and Triggers

1. Create a **new query**
2. Open `database_rls_policies_and_triggers.sql`
3. Copy and paste the contents
4. Click **"Run"**

### Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see all your tables listed:
   - users
   - opportunities
   - ngo_profile
   - seeker_profiles
   - cvs
   - And many more...

---

## 🔧 Method 2: Using psql Command Line (Advanced)

### Step 1: SSH into your VPS

```bash
ssh user@195.35.28.149
```

### Step 2: Navigate to your project directory

```bash
cd /path/to/your/project
```

### Step 3: Run the schema files

```bash
# Connect to the database and run the schema
psql -h localhost -U postgres -d postgres -f complete_database_schema.sql

# Run indexes
psql -h localhost -U postgres -d postgres -f database_indexes_and_sequences.sql

# Run RLS policies
psql -h localhost -U postgres -d postgres -f database_rls_policies_and_triggers.sql
```

---

## 🧪 Verify Database Setup

Run the test script to verify everything is working:

```bash
# From your local machine
node test-supabase-connection.js
```

You should see:
- ✅ All tables accessible
- ✅ No "relation does not exist" errors
- ✅ Connection successful

---

## 📊 Expected Tables

After setup, you should have the following tables:

### Core Tables
- `users` - User authentication
- `opportunities` - Job/funding/training opportunities
- `ngo_profile` - NGO organization profiles
- `seeker_profiles` - Job seeker profiles
- `cvs` - Resume/CV management

### Supporting Tables
- `ngo_users` - NGO team members
- `additional_info` - Additional profile information
- `documents` - File uploads
- `applications` - Job applications
- `scraped_jobs` - Scraped job listings
- `scraped_opportunities` - Scraped opportunities

### CV-Related Tables
- `cv_work_experiences`
- `cv_education`
- `cv_skills`
- `cv_languages`
- `cv_certificates`
- `cv_projects`
- `cv_external_links`

### Process Management
- `process_templates`
- `process_steps`
- `process_instances`
- `process_step_instances`

---

## 🎯 Next Steps

After setting up the database:

1. **Update your application** to use the new tables
2. **Test user registration** and login
3. **Create test data** if needed
4. **Set up backups** for your database

---

## 🆘 Troubleshooting

### Issue: "relation already exists"
**Solution:** This is normal if tables already exist. The `IF NOT EXISTS` clause prevents errors.

### Issue: "permission denied"
**Solution:** Make sure you're using the correct database user with sufficient privileges.

### Issue: "connection refused"
**Solution:** 
- Check if Supabase is running: `docker ps`
- Check if port 8000 is open: `netstat -tlnp | grep 8000`

### Issue: "authentication failed"
**Solution:** Verify your database credentials in the Supabase dashboard.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?** Check the troubleshooting section or review the error messages in the Supabase dashboard logs.

