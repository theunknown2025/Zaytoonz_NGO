# External Opportunities Management

This section provides comprehensive management tools for scraped opportunities from external websites.

## Overview

The External Opportunities section allows administrators to:
- View and manage scraped job opportunities
- Browse funding and grant opportunities
- Discover training and educational programs
- Filter and search through opportunities
- Update opportunity status (active/inactive/archived)
- Delete outdated opportunities

## Pages Structure

### Main Overview (`/admin/ExternalOpportunities`)
- Dashboard with opportunity statistics
- Quick navigation to specific opportunity types
- Links to start new scraping sessions

### Jobs (`/admin/ExternalOpportunities/Jobs`)
- Lists all scraped job opportunities
- Filters by status (active, inactive, archived)
- Search by title, company, or location
- Individual opportunity management

### Funding (`/admin/ExternalOpportunities/Funding`)
- Displays funding and grant opportunities
- Similar filtering and search capabilities
- Focus on funding amounts and organization details

### Training (`/admin/ExternalOpportunities/Training`)
- Shows educational and training programs
- Highlights duration and certification details
- Provider and location information

## Features

### Search and Filtering
- Real-time search across title, company, and location
- Status-based filtering (active/inactive/archived)
- Type-specific filtering (jobs/funding/training)

### Opportunity Management
- Status updates (active → inactive → archived)
- Bulk operations for selected items
- Individual opportunity deletion
- Original source link access

### Data Display
- Comprehensive opportunity details
- Metadata preservation (scraped date, tags, etc.)
- Responsive design for mobile and desktop

## Integration

This section integrates with:
- `/api/admin/scraped-opportunities` - CRUD operations
- `database/migrations/create_scraped_opportunities.sql` - Database schema
- Zaytoonz scraper (`/admin/zaytoonz-scraper`) - Data source

## Navigation

Accessible through the admin sidebar under "External Opportunities" with sub-sections:
- Overview - Main dashboard
- Jobs - Job opportunities
- Funding - Grant and funding opportunities  
- Training - Educational programs

## Database

Uses dedicated scraped opportunities tables:
- `scraped_opportunities` - Main opportunity data
- `scraped_opportunity_details` - Detailed information
- `scraped_opportunities_complete` - Combined view for easy querying 