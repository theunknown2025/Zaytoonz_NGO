# Manual Scraper Guide

## Overview
The Manual Scraper allows you to extract structured data from websites by manually selecting elements, similar to rss.app but built from scratch and integrated into Zaytoonz.

## How to Use

### Step 1: Load a Website
1. Enter the website URL (e.g., `https://unicef.jobs.com`)
2. Click "Load Website"
3. The website will appear on the right side

### Step 2: Create Sections
1. Click "Add Section" on the left panel
2. Name your section (e.g., "Job Title", "Company", "Location", "Deadline")
3. The new section will appear in the left panel

### Step 3: Select Elements

#### Method 1: Click Selection (if supported)
1. Select a section from the left panel
2. Click "Click Selection"
3. Click on an element in the website
4. Similar elements will be automatically selected

#### Method 2: Manual Selector (recommended for CORS-blocked sites)
1. Select a section from the left panel
2. Click "Manual Selector"
3. Use browser developer tools:
   - Right-click on the element you want → "Inspect"
   - Right-click on the HTML tag → "Copy" → "Copy selector"
   - Paste the selector into the input field
4. Click "Extract"

### Step 4: Add More Sections
Repeat steps 2-3 for additional data fields you want to capture.

### Step 5: Generate Opportunities
1. Click "Generate Opportunities" when you have at least one section with elements
2. Review the generated opportunities
3. Select which opportunities to include in the RSS feed
4. Click "Generate RSS"

### Step 6: Export RSS
1. Copy the RSS content to clipboard, or
2. Download as XML file

## Tips

### Common CSS Selectors
- `.class-name` - Elements with a specific class
- `#id-name` - Element with a specific ID
- `h2` - All h2 headings
- `.job-card .title` - Title elements inside job cards
- `[data-job-id]` - Elements with specific attributes

### Best Practices
1. **Start with the most common element** (usually job titles)
2. **Use descriptive section names** that match the data
3. **Test your selectors** before generating - check if the right number of elements are selected
4. **Use Manual Selector for better reliability** when websites block iframe interaction

### Troubleshooting

#### "Cannot Load Website"
- Some websites block iframe embedding
- Try the "Try with CORS Proxy" button
- Use "Manual Selector" method instead

#### "No elements found"
- Check your CSS selector syntax
- Use browser developer tools to test selectors
- Try a simpler selector (e.g., just `.title` instead of `.job-card .title a`)

#### Elements not clickable
- Most websites block direct clicking due to CORS
- Use the "Manual Selector" method instead
- This is normal and expected behavior

### Example Workflow

For a job site like unicef.jobs.com:

1. **Section 1: "Job Title"**
   - Selector: `.job-title` or `h3 a`
   
2. **Section 2: "Location"**
   - Selector: `.location` or `.job-location`
   
3. **Section 3: "Department"**
   - Selector: `.department` or `.job-category`
   
4. **Section 4: "Deadline"**
   - Selector: `.deadline` or `.closing-date`

This will create structured opportunities with all the relevant job information that can be exported as RSS feeds for automated processing.

# Manual Scraper - CSS Selector Guide

## Overview
The Manual Scraper allows you to extract data from websites using CSS selectors. This guide helps you troubleshoot common selector issues.

## Common CSS Selector Issues

### 1. Numeric ID Escaping Issue ⚠️

**Problem:** Your browser might copy selectors like `#\31 72831 > div` which contain CSS escaping.

**Solution:** The `\31` represents CSS escaping for numeric IDs. Try these alternatives:

- **Remove escaping:** `#172831 > div`
- **Use attribute selector:** `[id="172831"] > div`
- **Use class-based selector:** `.col-sm-10 h2 a`
- **Use partial match:** `[id*="72831"] h2 a`

### 2. Dynamic Content

**Problem:** Elements loaded by JavaScript may not be captured.

**Solution:**
- Wait for page to fully load
- Use more general selectors
- Try class-based selectors instead of IDs

### 3. CORS Restrictions

**Problem:** Cannot access iframe content due to security restrictions.

**Solution:**
- Use the "Manual Selector" option
- Our server will fetch and parse the page
- Use browser dev tools to find selectors

## How to Find CSS Selectors

1. **Using Browser Dev Tools:**
   - Right-click on element → Inspect
   - Right-click on HTML tag → Copy → Copy selector
   - Paste into Manual Selector input

2. **Common Selector Patterns:**
   ```css
   .class-name          /* Class selector */
   #id-name            /* ID selector */
   tag                 /* Tag selector */
   .parent .child      /* Descendant selector */
   .parent > .child    /* Direct child selector */
   [attribute="value"] /* Attribute selector */
   ```

## Troubleshooting Steps

1. **Start Simple:** Try basic selectors like `h1`, `h2`, `a`
2. **Check Element Structure:** Use browser dev tools to verify structure
3. **Use Class Selectors:** More reliable than numeric IDs
4. **Try Attribute Selectors:** `[id*="partial-id"]` for partial matches
5. **Check Console:** Server logs show what selectors are being tested

## Examples

### Good Selectors
```css
h2 > a              /* Simple and reliable */
.job-title          /* Class-based */
.card .title        /* Nested classes */
[href*="/jobs/"]    /* Attribute-based */
```

### Problematic Selectors
```css
#\31 72831 > div    /* CSS escaping issue */
#very-specific-id   /* Too specific, might change */
```

## Server-Side Processing

The Manual Scraper uses server-side extraction with the following features:

- **Multiple Selector Attempts:** Tries different variations of your selector
- **CSS Escaping Handling:** Automatically handles `\31` escaping
- **Debug Information:** Logs available IDs and element counts
- **Fallback Options:** Provides manual input if automated extraction fails

## Best Practices

1. **Use Stable Selectors:** Choose class names that are unlikely to change
2. **Avoid Over-Specificity:** Use the simplest selector that works
3. **Test Incrementally:** Start with broad selectors and narrow down
4. **Check Multiple Pages:** Ensure selectors work across similar pages
5. **Use Semantic Classes:** Look for meaningful class names like `.job-title`, `.company-name` 