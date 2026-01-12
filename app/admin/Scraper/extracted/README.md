# Extracted Opportunities Page - Features Documentation

## Overview
The Extracted Opportunities page (`/admin/Scraper/extracted`) displays fully extracted content from opportunity detail pages. It includes powerful filtering and export capabilities.

## New Features Added

### 1. Country Filter
- **Location**: Filter bar alongside Type and Status filters
- **Functionality**: Extracts country information from the `location` field and provides a dropdown to filter opportunities by country
- **Algorithm**: 
  - Parses location strings (e.g., "New York, USA" → "USA")
  - Takes the last comma-separated value as the country
  - Automatically populates the dropdown with unique countries from the dataset

### 2. Excel Export Feature

#### Export Button
- **Location**: Top-right header area
- **Status**: Shows as disabled when no opportunities are available
- **Action**: Opens the Excel Export Modal

#### Excel Export Modal
The modal provides comprehensive control over what data to export:

##### Column Selection Interface
Organized into four groups:

1. **Basic Information**
   - Title
   - Type (job/funding/training)
   - Source URL
   - Status (pending/processing/completed/failed)

2. **Details**
   - Company/Organization
   - Location
   - Country (extracted)
   - Salary/Amount
   - Job Type/Contract
   - Deadline

3. **Content Fields**
   - Description
   - Requirements
   - Responsibilities
   - Qualifications
   - Benefits
   - How to Apply
   - Contact Info
   - Full Raw Content

4. **Extraction Metadata**
   - AI Model Used
   - Extraction Cost
   - Extraction Error
   - Extracted Date
   - Created Date
   - Updated Date

##### Quick Actions
- **Select All**: Selects all 26 available columns
- **Clear All**: Deselects all columns
- **Reset to Default**: Selects Basic Info + Details columns (default selection)
- **Select/Unselect Group**: Toggle all columns in a specific group

##### Export Details
- Shows the number of selected columns
- Displays the number of opportunities that will be exported (respects current filters)
- Validates that at least one column is selected
- Generates filename with applied filters and timestamp

#### Generated Excel File Structure

##### Sheet 1: "Extracted Opportunities"
Contains all selected columns with formatted data:
- **Text Truncation**: Long content fields are truncated to Excel's 32,767 character limit
- **Date Formatting**: All dates formatted as readable strings (e.g., "Dec 18, 2025, 10:30 AM")
- **Column Widths**: Auto-adjusted based on content type
  - Content columns: 50 characters wide
  - URLs: 40 characters
  - Titles: 35 characters
  - Names/Locations: 25 characters
  - Others: 15 characters

##### Sheet 2: "Export Summary"
Provides export metadata:
- Total number of opportunities exported
- Export date and time
- All filters applied:
  - Type filter
  - Status filter
  - Country filter
- Number of columns exported

#### Filename Format
```
extracted_opportunities_[type]_[status]_[country]_YYYY-MM-DD.xlsx
```

Example: `extracted_opportunities_job_completed_USA_2025-12-18.xlsx`

### 3. Active Filters Display
- **Location**: Below the filter bar
- **Shows**: All currently active filters with ability to quickly clear each one
- **Includes**:
  - Type filter
  - Status filter
  - Country filter (NEW)
  - Search query
- **Action**: Click the X icon to quickly remove a specific filter

## Technical Implementation

### Files Created/Modified

#### 1. `excelExporter.ts` (NEW)
A utility module providing:
- **Interfaces**: `ExtractedOpportunity`, `ExportColumn`
- **Functions**:
  - `extractCountry()`: Parses location to extract country
  - `getUniqueCountries()`: Gets all unique countries from opportunities
  - `exportToExcel()`: Main export function using xlsx library
  - `getColumnsByGroup()`: Returns columns by group
  - `getDefaultSelectedColumns()`: Returns default column selection

#### 2. `page.tsx` (MODIFIED)
Added:
- Country filter state and dropdown
- Active filters display component
- Export modal with column selection
- Excel export button
- Integration with excelExporter utility

### Dependencies Used
- **xlsx** (v0.18.5): Already installed, used for Excel file generation
- **@heroicons/react**: New icons added:
  - `ArrowDownTrayIcon`: Export button
  - `Squares2X2Icon`: Column group icons

## Usage Guide

### For Users

#### Filtering Opportunities
1. Use the search bar to search by title, company, location, or description
2. Select a Type filter (Jobs/Funding/Training)
3. Select a Status filter (Completed/Pending/Processing/Failed)
4. Select a Country filter to view opportunities from a specific country
5. Active filters are displayed below the filter bar with quick clear options

#### Exporting to Excel
1. Apply desired filters (optional)
2. Click the green "Export to Excel" button
3. In the modal, select which columns to include:
   - Use group toggles for quick selection
   - Or check/uncheck individual columns
4. Review the export summary (number of opportunities, selected columns)
5. Click "Export [N] Opportunities"
6. The Excel file will download automatically

#### Tips
- Start with the default column selection and add content fields if needed
- The country filter uses the last part of the location field
- Export respects all active filters (type, status, country, search)
- Long content is automatically truncated to fit Excel's limits

### For Developers

#### Adding New Export Columns
1. Open `excelExporter.ts`
2. Add the column to the `availableColumns` array:
```typescript
{ key: 'new_field', label: 'New Field Label', group: 'details' }
```
3. Handle any special formatting in the `exportToExcel()` function

#### Modifying Country Extraction Logic
Edit the `extractCountry()` function in `excelExporter.ts`:
```typescript
export function extractCountry(location: string | null): string {
  // Your custom logic here
}
```

#### Customizing Export Filename
Modify the filename generation in the `exportToExcel()` function around line 190.

## Future Enhancements (Suggestions)

1. **Save Export Presets**: Allow users to save their column selections
2. **Schedule Exports**: Automatically export at intervals
3. **Email Exports**: Send Excel file via email
4. **CSV Option**: Add CSV export alongside Excel
5. **Advanced Country Parsing**: Use a country detection library for better accuracy
6. **Bulk Actions**: Select multiple opportunities for batch export or deletion
7. **Export History**: Track what was exported and when

## Support

For issues or questions:
- Check the browser console for detailed error messages
- Verify that the xlsx library is properly installed
- Ensure opportunities are loading correctly before exporting
- Check that filters are working properly before export

## Version History

### v1.0 (December 18, 2025)
- ✅ Added Country filter
- ✅ Added Excel export with column selection
- ✅ Created excelExporter utility module
- ✅ Added active filters display
- ✅ Fixed all TypeScript linter errors

