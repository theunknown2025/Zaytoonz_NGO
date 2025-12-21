# Zaytoonz NGO Admin Scraper Documentation

## Overview
The Zaytoonz Scraper is a powerful web scraping tool integrated into the admin dashboard that allows administrators to extract job opportunities from various job posting websites.

## Features

### 1. Web Scraping Capabilities
- **Multiple Site Support**: Currently optimized for Tanmia.ma with extensible architecture for other job sites
- **Intelligent Extraction**: Uses Puppeteer + Cheerio for reliable data extraction
- **URL Validation**: Ensures proper URL format before scraping
- **Redirect Handling**: Automatically follows redirects to reach target pages

### 2. Dual Storage System
- **Local Storage**: Temporary storage for immediate review and editing
- **Database Storage**: Permanent storage in Supabase database
- **Seamless Migration**: Easy transfer from local to database storage

### 3. User Interface
- **Dual View Mode**: Toggle between Local Storage and Database views
- **Real-time Updates**: Live job counter in view mode toggle
- **Batch Operations**: Save all jobs to database at once
- **Individual Management**: Remove jobs individually from local storage

## Technical Architecture

### Backend Components
1. **API Route**: `/api/scraper/jobs`
   - `POST`: Scrape new job from URL
   - `GET`: Fetch saved jobs from database
   - `PUT`: Save multiple jobs to database

2. **Scraper Service**: `app/lib/scraper.ts`
   - Puppeteer browser automation
   - Cheerio HTML parsing
   - Multiple selector strategies
   - Comprehensive error handling

3. **Database Schema**: `scraped_jobs` table
   ```sql
   - id (UUID, Primary Key)
   - title (TEXT)
   - company (TEXT)
   - location (TEXT)
   - job_type (TEXT)
   - salary_range (TEXT)
   - description (TEXT)
   - source_url (TEXT)
   - remote_work (BOOLEAN)
   - tags (TEXT[])
   - experience_level (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   ```

### Frontend Components
1. **ScrapedJobs Component**: Main interface
   - URL input and validation
   - Job display cards
   - Action buttons and controls
   - Loading states and error handling

2. **Admin Navigation**: Integrated into admin sidebar
   - "Zaytoonz Scraper" button with GlobeAltIcon
   - Routing to `/admin/scraper`

## Usage Guide

### Scraping New Jobs
1. Navigate to Admin → Zaytoonz Scraper
2. Ensure you're in "Local Storage" view mode
3. Enter a job posting URL in the input field
4. Click "Scrape Job" button
5. Wait for extraction to complete
6. Review the extracted job data

### Managing Scraped Jobs
1. **Local Storage View**:
   - Review scraped jobs before saving
   - Remove individual jobs if needed
   - Clear all jobs to start fresh
   - Save all jobs to database when ready

2. **Database View**:
   - View permanently saved jobs
   - Refresh to get latest data
   - Jobs are sorted by creation date (newest first)

### Best Practices
1. **URL Selection**: Use direct job posting URLs for best results
2. **Review Before Saving**: Always review scraped data in local storage first
3. **Batch Processing**: Save multiple jobs at once for efficiency
4. **Regular Monitoring**: Check logs for extraction quality

## Supported Websites

### Currently Optimized
- **Tanmia.ma**: Full support with specialized selectors
  - Job listings pages
  - Individual job postings
  - Company information extraction

### Extensible Architecture
The scraper is designed to easily add support for:
- LinkedIn job postings
- Indeed listings
- Other job boards with minimal configuration

## Error Handling

### Frontend
- URL validation before scraping
- Loading states during operations
- Toast notifications for user feedback
- Graceful error recovery

### Backend
- Comprehensive error logging
- Timeout handling for slow pages
- Fallback extraction strategies
- Database operation validation

## Development Notes

### Dependencies
- `puppeteer`: Browser automation
- `cheerio`: HTML parsing
- `@types/cheerio`: TypeScript support
- `@types/puppeteer`: TypeScript support

### Configuration
- Browser launched in headless mode
- 30-second timeout for page loads
- User-agent spoofing for better compatibility
- Extensive debugging logs available

## Future Enhancements
1. **Multi-site Support**: Add more job board integrations
2. **Scheduling**: Automated scraping at regular intervals
3. **Data Enrichment**: Additional job metadata extraction
4. **Export Features**: CSV/Excel export capabilities
5. **Advanced Filtering**: Job categorization and filtering
6. **Analytics**: Scraping success rates and metrics

## Troubleshooting

### Common Issues
1. **No Jobs Extracted**: Check URL format and site accessibility
2. **Slow Scraping**: Network timeout - retry after a moment
3. **Database Errors**: Check Supabase connection and table schema
4. **Browser Errors**: Puppeteer dependencies may need reinstallation

### Debug Information
- Enable console logging for detailed extraction steps
- Check browser network tab for failed requests
- Verify Supabase table structure matches schema

## Security Considerations
- Rate limiting to prevent abuse
- URL validation to prevent malicious input
- Secure database operations
- No sensitive data storage in scraped content 