# Evaluation Template Display Testing Guide

## Issue Fixed
The evaluation template was not displaying in the applications section because the evaluation choice made during opportunity creation was not being saved to localStorage where the ApplicationEvaluation component expected to find it.

## What Was Changed

### 1. localStorage Integration in Opportunity Creation
- Modified `handleEvaluationSelect` function to save evaluation choices to localStorage
- Storage key format: `opportunity_evaluation_{opportunityId}`
- Data structure: `{ evaluationId, evaluationName, selectedAt }`

### 2. Loading Evaluation Choices
- Added localStorage loading in `loadExistingOpportunityData` function
- Evaluation choices are now restored when editing opportunities

## Testing Steps

### Prerequisites
1. Ensure you have created at least one evaluation template
   - Go to `/ngo/resources/tools/EvaluationMaker`
   - Create a test evaluation with some criteria

### Test 1: Create New Opportunity with Evaluation

1. **Create Opportunity**:
   - Go to `/ngo/opportunities/new`
   - Follow the steps until you reach "Evaluation" (Step 5)
   - Select an evaluation template (not "No Evaluation")
   - Complete the opportunity creation process

2. **Check localStorage**:
   - Open browser DevTools (F12)
   - Go to Application/Storage → Local Storage
   - Look for key: `opportunity_evaluation_{opportunityId}`
   - Should contain: `{"evaluationId": "...", "evaluationName": "...", "selectedAt": "..."}`

3. **Test Application Evaluation**:
   - Create or view applications for this opportunity
   - Go to `/ngo/applications`
   - Expand an application for the opportunity you just created
   - **Expected**: Evaluation section should display the selected template
   - **Expected**: Template name, description, criteria, and radar chart should be visible

### Test 2: Create Opportunity Without Evaluation

1. **Create Opportunity Without Evaluation**:
   - Go to `/ngo/opportunities/new`
   - Follow steps until "Evaluation" (Step 5)
   - Select "No Evaluation"
   - Complete the opportunity creation process

2. **Check localStorage**:
   - Should NOT have `opportunity_evaluation_{opportunityId}` key
   - Or key should be removed if it existed before

3. **Test Application Evaluation**:
   - Go to `/ngo/applications`
   - Expand an application for this opportunity
   - **Expected**: Evaluation section should show "No Evaluation Template" message

### Test 3: Edit Existing Opportunity

1. **Edit Opportunity**:
   - Go to an existing opportunity's edit page
   - Navigate to the Evaluation step
   - Change the evaluation selection
   - Save the changes

2. **Verify Persistence**:
   - Check localStorage for updated evaluation choice
   - Go to applications and verify the new evaluation template appears

### Test 4: Browser Console Debugging

Enable browser console logging to track the evaluation choice flow:

1. **Expected Console Messages**:
   ```
   Saved evaluation choice to localStorage: opportunity_evaluation_{id} {...}
   Loaded evaluation choice from localStorage: {...}
   ✅ Loaded persisted CV for opportunity {id}: {template name}
   ```

2. **In ApplicationEvaluation Component**:
   - Should log successful template loading
   - Should NOT show "No evaluation template found" if one was selected

### Test 5: Multiple Opportunities

1. Create multiple opportunities with different evaluation templates
2. Verify each opportunity maintains its own evaluation choice
3. Check that applications for each opportunity show the correct template

## Expected Behavior

### When Evaluation is Selected:
- ✅ Evaluation template appears in applications
- ✅ Template name and description are visible
- ✅ Criteria are listed with scoring interface
- ✅ Radar chart displays properly
- ✅ "Start Evaluation" or "Edit Evaluation" button is available

### When No Evaluation is Selected:
- ✅ "No Evaluation Template" message appears
- ✅ Explanation that no template was selected
- ✅ Option to manually review applications

## Troubleshooting

### Issue: Template Still Not Showing
1. **Check localStorage**: Verify evaluation choice is saved with correct key
2. **Check opportunityId**: Ensure the opportunityId matches between creation and applications
3. **Clear localStorage**: Clear browser storage and test fresh opportunity creation
4. **Console Errors**: Check for JavaScript errors in browser console

### Issue: Wrong Template Appears
1. **Verify localStorage keys**: Each opportunity should have its own key
2. **Check evaluation ID**: Ensure evaluationId matches an existing template
3. **Refresh evaluation templates**: Go to Evaluation Maker and verify template still exists

### Issue: localStorage Not Working
1. **Browser Settings**: Ensure localStorage is enabled
2. **Private Mode**: Some browsers restrict localStorage in private/incognito mode
3. **Storage Quota**: Clear other localStorage data if storage is full

## Database Migration Note

When database access becomes available, the localStorage approach should be migrated to use the `opportunity_evaluations` table:

```sql
-- This table structure is already prepared
CREATE TABLE opportunity_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL,
  evaluation_id VARCHAR(255) NOT NULL,
  evaluation_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The ApplicationEvaluation component is designed to work with both localStorage (current) and database (future) approaches. 