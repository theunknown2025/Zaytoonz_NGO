# Evaluation System Testing Guide

This guide explains how to test the new Application Evaluation functionality that has been added to the Zaytoonz NGO platform.

## Overview

The evaluation system allows NGOs to:
1. Create evaluation templates with custom criteria and scoring scales
2. Associate evaluation templates with opportunities during creation
3. Evaluate individual applicants using those templates with interactive radar charts
4. View, edit, and track evaluation results

## Prerequisites

Before testing, ensure you have:
1. Development server running (`npm run dev`)
2. Access to the NGO dashboard at `/ngo/applications`
3. Some test opportunities with applications to evaluate

## Step-by-Step Testing

### 1. Create an Evaluation Template

1. Go to `/ngo/resources/tools`
2. Click on "Evaluation Maker" tool
3. Create a new evaluation with:
   - Name: "Technical Skills Assessment"
   - Description: "Evaluate candidate's technical capabilities"
   - Scale: 10 (1-10 scoring)
   - Criteria: Add criteria like "Programming Skills", "Problem Solving", "Communication", etc.
4. Save the evaluation (stored in localStorage)

### 2. Create an Opportunity with Evaluation

1. Go to `/ngo/opportunities/new`
2. Complete Steps 1-4 as normal
3. In Step 5 (Evaluation):
   - Select the evaluation template you created
   - Or choose "Skip evaluation for this opportunity"
4. Complete the opportunity creation process

### 3. Test Application Evaluation

1. Ensure there are applications for your opportunity (you may need to create test applications)
2. Go to `/ngo/applications`
3. Find your opportunity and click "View Applications"
4. Expand an application by clicking the chevron
5. Scroll down to the "Candidate Evaluation" section

### 4. Perform an Evaluation

**For opportunities WITH evaluation templates:**
1. You should see the evaluation template information
2. Click "Start Evaluation" button
3. Use the sliders to score each criterion (1 to scale max)
4. Watch the radar chart update in real-time
5. Add optional notes
6. Click "Save Evaluation"
7. Verify the evaluation is saved and displays correctly

**For opportunities WITHOUT evaluation templates:**
1. You should see "No Evaluation Template" message
2. This indicates the opportunity was created without an evaluation template

### 5. Edit Existing Evaluations

1. For applications that have been evaluated:
2. Click "Edit Evaluation" button
3. Modify scores and notes
4. Save changes
5. Verify updates are preserved

## Data Storage

**Current Implementation:**
- Evaluation templates: `localStorage.getItem('evaluations')`
- Opportunity evaluation choices: `localStorage.getItem('opportunity_evaluation_{opportunityId}')`
- Individual application evaluations: `localStorage.getItem('evaluation_{applicationId}')`

**Future Database Integration:**
- When database access is available, refer to `DATABASE_SCHEMA_EVALUATIONS.md`
- API endpoints are prepared in `/app/api/evaluations/applications/route.ts`

## Visual Elements to Test

### Radar Chart
- Should display all criteria as points around the circle
- Values should scale correctly (0 to max scale)
- Chart should update in real-time as you adjust scores
- Colors should be consistent with app theme (olive green)

### Scoring Interface
- Sliders should work smoothly
- Current score should display next to each criterion
- Overall score percentage should calculate correctly
- Total points should show as "X out of Y points"

### Status Indicators
- Evaluated applications should show green "Evaluated" badge
- Evaluation should persist between page refreshes
- Edit mode should pre-populate with existing scores

## Test Scenarios

### Scenario 1: New Evaluation
1. Create evaluation template
2. Create opportunity with template
3. Evaluate new application
4. Verify scores and radar chart

### Scenario 2: Edit Evaluation
1. Use existing evaluated application
2. Edit scores and notes
3. Verify changes persist
4. Check radar chart updates

### Scenario 3: No Template
1. Create opportunity without evaluation template
2. Check application shows "No Evaluation Template"
3. Verify no evaluation interface appears

### Scenario 4: Multiple Criteria
1. Create template with 5+ criteria
2. Test scrolling/layout with many criteria
3. Verify radar chart handles multiple points

## Expected Behavior

✅ **Working Features:**
- Evaluation template creation and storage
- Opportunity-evaluation association
- Interactive scoring with sliders
- Real-time radar chart updates
- Score persistence and retrieval
- Edit functionality
- Notes support
- Responsive design

🔄 **Pending Database Integration:**
- Persistent storage across devices
- User authentication integration
- Audit trails and history
- Bulk operations
- Advanced reporting

## Troubleshooting

**Issue: Evaluation not appearing**
- Check if opportunity has evaluation template selected
- Verify localStorage contains template data
- Check browser console for errors

**Issue: Radar chart not displaying**
- Ensure recharts library is installed
- Check for JavaScript errors in console
- Verify criteria data structure

**Issue: Scores not saving**
- Check localStorage permissions
- Verify all required fields are filled
- Look for validation errors

**Issue: Template not found**
- Ensure evaluation template was saved properly
- Check localStorage for 'evaluations' key
- Verify template ID matching

## Browser Compatibility

Tested browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: localStorage is required for current implementation.

## Files Modified

- `app/ngo/applications/page.tsx` - Added evaluation section
- `app/ngo/applications/components/ApplicationEvaluation.tsx` - Main evaluation component
- `app/api/evaluations/applications/route.ts` - API endpoints (prepared for database)
- Various opportunity creation files for Step 5 integration

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage data integrity
3. Ensure all dependencies are installed
4. Review this testing guide thoroughly 