# CV Persistence Testing Guide

## Overview
This guide helps you test the new CV selection persistence feature in the Zaytoonz NGO platform. The feature ensures that when users select a CV for an opportunity application and navigate away, their selection remains when they return to the same opportunity.

## How It Works

### Storage Mechanism
- Uses browser's `localStorage` for persistence
- Storage key format: `selectedCV_{opportunityId}`
- Each opportunity maintains its own CV selection independently
- Data is automatically cleared after successful application submission

### Key Features
1. **Persistent Selection**: CV selection survives page navigation and browser refresh
2. **Opportunity-Specific**: Different opportunities can have different CV selections
3. **Auto-Cleanup**: Persistence is cleared after successful submission
4. **Manual Removal**: Users can manually remove CV selection which also clears persistence

## Testing Steps

### Test 1: Basic Persistence
1. Navigate to any opportunity detail page (e.g., `/seeker/opportunities/[id]`)
2. Scroll to the "Include CV" section
3. Click "Select CV to Include"
4. Choose any CV from the modal
5. Confirm that the CV appears as selected with green background
6. Navigate away from the page (e.g., go to home page)
7. Return to the same opportunity page
8. ✅ **Expected**: CV selection should still be visible and selected

### Test 2: Multiple Opportunities
1. Go to Opportunity A, select CV 1
2. Go to Opportunity B, select CV 2
3. Navigate back to Opportunity A
4. ✅ **Expected**: CV 1 should still be selected
5. Navigate back to Opportunity B
6. ✅ **Expected**: CV 2 should still be selected

### Test 3: CV Removal
1. Select a CV for any opportunity
2. Navigate away and come back (verify persistence works)
3. Click the "Remove" button next to the selected CV
4. ✅ **Expected**: CV is removed and green selection box disappears
5. Navigate away and come back
6. ✅ **Expected**: No CV should be selected (persistence cleared)

### Test 4: Browser Refresh
1. Select a CV for any opportunity
2. Refresh the browser page (F5 or Ctrl+R)
3. ✅ **Expected**: CV selection should still be present after refresh

### Test 5: Application Submission
1. Select a CV for any opportunity
2. Fill out the application form
3. Submit the application successfully
4. ✅ **Expected**: Application submitted with CV attached
5. Navigate away and return to the same opportunity
6. ✅ **Expected**: CV selection should be cleared (since application was submitted)

### Test 6: Edit Mode (If Applicable)
1. If you have an existing application, go to edit mode
2. Select a different CV
3. Navigate away and come back
4. ✅ **Expected**: New CV selection should persist
5. Cancel edit mode
6. ✅ **Expected**: CV selection should remain

## Browser Console Debugging

Open browser Developer Tools (F12) and check the Console tab for debug messages:

### Expected Log Messages
- `ℹ️ No persisted CV found for opportunity {id}` - When no CV is stored
- `✅ Loaded persisted CV for opportunity {id}: {CV name}` - When CV is loaded from storage
- `Persisted CV selection: {CV name}` - When CV is saved to storage
- `Cleared persisted CV selection` - When persistence is cleared

### LocalStorage Inspection
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Look for LocalStorage entries with keys like `selectedCV_{opportunityId}`
4. Values should contain JSON data with CV information

## Common Issues & Troubleshooting

### CV Selection Not Persisting
- Check browser console for error messages
- Verify localStorage is enabled in browser
- Clear browser cache and try again

### Wrong CV Appearing
- Each opportunity should have its own storage key
- Check console logs to verify correct opportunity ID
- Clear all localStorage entries and test again

### Persistence Not Clearing After Submission
- Check if application submission was successful
- Look for success messages in console
- Verify the `clearPersistedCV()` function is being called

## Technical Implementation

### Storage Functions
- `loadPersistedCV()` - Loads CV from localStorage on component mount
- `persistCVSelection(cv)` - Saves CV to localStorage when selected
- `clearPersistedCV()` - Removes CV from localStorage
- `handleRemoveCV()` - Removes CV and clears persistence
- `getStorageKey()` - Generates unique storage key for each opportunity

### Integration Points
- Component mount: Loads persisted CV
- CV selection: Saves to localStorage
- CV removal: Clears localStorage
- Application submission: Clears localStorage after success
- Navigation: Persistence survives page changes

## Success Criteria
✅ CV selection persists across page navigation  
✅ Different opportunities maintain separate CV selections  
✅ CV selection survives browser refresh  
✅ Persistence is cleared after successful application submission  
✅ Manual CV removal clears persistence  
✅ No console errors during normal operation  
✅ localStorage contains expected data structure 