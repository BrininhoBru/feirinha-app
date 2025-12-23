# Testing Guide: Edit and Delete List Functionality

This guide provides step-by-step instructions for testing the new edit and delete list functionality.

## Prerequisites

1. Running instance of FeirinhaApp
2. Two test user accounts (for creator and shared user scenarios)
3. At least one list created

## Test Scenarios

### Scenario 1: List Creator - Edit List Name

**Setup:**
- Log in as the user who created a list
- Navigate to any list you created

**Steps:**
1. Look for the three-dot menu (⋮) button in the list header
2. Click the three-dot menu button
3. Select "Editar Nome" from the dropdown
4. A dialog should appear with the current list name
5. Change the list name to something new
6. Click "Salvar" button

**Expected Results:**
- ✅ Three-dot menu button should be visible in the header
- ✅ Dialog opens with current list name pre-filled
- ✅ After clicking "Salvar", a success toast notification appears
- ✅ Dialog closes automatically
- ✅ List name updates in the header
- ✅ List name persists after page refresh

**Alternative Test:**
- Press Enter key instead of clicking "Salvar" button
- Expected: Same behavior as clicking the button

**Edge Cases:**
- Try to save with empty name → Button should be disabled
- Try to save with only spaces → Should not save

---

### Scenario 2: List Creator - Delete List

**Setup:**
- Log in as the user who created a list
- Navigate to any list you created

**Steps:**
1. Click the three-dot menu (⋮) button in the list header
2. Select "Excluir Lista" (in red) from the dropdown
3. A browser confirmation dialog should appear
4. Click "OK" to confirm deletion

**Expected Results:**
- ✅ Three-dot menu button should be visible
- ✅ "Excluir Lista" option appears in red text
- ✅ Confirmation dialog asks: "Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita."
- ✅ After confirming, a success toast notification appears
- ✅ User is redirected to the lists page (/listas)
- ✅ Deleted list no longer appears in the lists page

**Edge Cases:**
- Cancel the confirmation dialog → List should not be deleted

---

### Scenario 3: Shared User - Cannot Edit List Name

**Setup:**
1. User A creates a list and shares it with User B
2. Log in as User B
3. Navigate to the shared list

**Steps:**
1. Look at the list header
2. Try to find the three-dot menu button

**Expected Results:**
- ✅ Three-dot menu button should NOT be visible
- ✅ "Compartilhada" badge should be visible next to the list name
- ✅ User can still add items to the list
- ✅ User can still edit items in the list
- ✅ User can still delete items from the list

---

### Scenario 4: Shared User - Backend Validation (API Test)

**Setup:**
- Same as Scenario 3 (User B has access to a list shared by User A)
- Open browser developer tools (F12)
- Go to the Console tab

**Steps:**
1. From the console, try to directly call the Supabase API to update the list:

```javascript
// Get the list ID from the URL
const listaId = window.location.pathname.split('/').pop();

// Try to update the list name (this should fail)
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
const { data, error } = await supabase
  .from('listas')
  .update({ nome: 'Hacked Name' })
  .eq('id', listaId);

console.log('Result:', { data, error });
```

**Expected Results:**
- ✅ The update should fail
- ✅ Error should be returned from Supabase
- ✅ List name should not change
- ✅ RLS policy blocks the unauthorized update

---

### Scenario 5: Shared User - Backend Validation for Delete (API Test)

**Setup:**
- Same as Scenario 3
- Open browser developer tools

**Steps:**
1. Try to directly call the Supabase API to delete the list:

```javascript
// Get the list ID from the URL
const listaId = window.location.pathname.split('/').pop();

// Try to delete the list (this should fail)
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
const { data, error } = await supabase
  .from('listas')
  .delete()
  .eq('id', listaId);

console.log('Result:', { data, error });
```

**Expected Results:**
- ✅ The delete should fail
- ✅ Error should be returned from Supabase
- ✅ List should still exist
- ✅ RLS policy blocks the unauthorized deletion

---

### Scenario 6: Multiple Lists - UI Consistency

**Setup:**
- Log in with a user that has:
  - At least one list they created
  - At least one list shared with them

**Steps:**
1. Navigate to the lists page (/listas)
2. Click on a list you created
3. Check if three-dot menu is visible
4. Go back and click on a shared list
5. Check if three-dot menu is visible

**Expected Results:**
- ✅ Three-dot menu visible for your own lists
- ✅ Three-dot menu NOT visible for shared lists
- ✅ "Compartilhada" badge only appears on shared lists

---

### Scenario 7: Toast Notifications

**Setup:**
- Test various error conditions

**Tests:**

**Test A: Network Error Simulation**
1. Open developer tools → Network tab
2. Enable "Offline" mode
3. Try to edit or delete a list
4. Expected: Error toast appears

**Test B: Permission Error**
1. Use the API test from Scenario 4 or 5
2. Expected: Permission error should be caught and appropriate toast shown

**Test C: Success Messages**
1. Successfully edit a list name
2. Expected: Green success toast appears
3. Successfully delete a list
4. Expected: Green success toast appears

---

## Visual Inspection Checklist

- [ ] Three-dot menu button matches app theme (emerald colors)
- [ ] Delete option is visually distinct (red text)
- [ ] Edit dialog follows app design patterns
- [ ] Toast notifications are readable and clear
- [ ] Icons are consistent with the app (using lucide-react)
- [ ] Dropdown menu animations are smooth
- [ ] Dialog animations are smooth
- [ ] Mobile responsive (test on smaller screens)

---

## Regression Testing

Ensure existing functionality still works:

- [ ] Can still add items to lists
- [ ] Can still edit items in lists
- [ ] Can still delete items from lists
- [ ] Can still share lists (for creators)
- [ ] Can still check/uncheck items
- [ ] Price tracking still works
- [ ] Real-time updates still work
- [ ] List totals calculate correctly

---

## Database Migration Test

**Important:** The database migration must be applied before testing.

**Steps:**
1. Ensure migration `20231004000000_fix_lista_update_policy.sql` is applied
2. Check the RLS policies:

```sql
-- Connect to your database and run:
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listas' AND policyname LIKE '%atualizam%';
```

**Expected Result:**
- Policy name should be "Apenas criadores atualizam listas"
- Policy should check `auth.uid() = criador_id`

---

## Performance Testing

- [ ] Edit operation completes in < 1 second
- [ ] Delete operation completes in < 2 seconds
- [ ] No lag when opening dropdown menu
- [ ] No lag when opening edit dialog
- [ ] Real-time updates still work after editing

---

## Accessibility Testing

- [ ] Dropdown menu can be accessed via keyboard
- [ ] Edit dialog can be accessed via keyboard
- [ ] Tab order is logical
- [ ] Enter key works in edit dialog
- [ ] Escape key closes dialogs
- [ ] Screen reader announces menu items
- [ ] Color contrast meets WCAG standards

---

## Known Limitations

1. The delete confirmation uses browser `confirm()` dialog
   - Future enhancement: Use a custom dialog component
   
2. Shared users see list items but not the creator's name
   - Future enhancement: Display creator info

---

## Bug Report Template

If you find any issues, report them using this template:

```
**Title:** [Clear, concise title]

**Scenario:** [Which test scenario]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:** [If applicable]

**Browser/Device:** [e.g., Chrome 120, iOS Safari]

**User Role:** [Creator or Shared User]

**Console Errors:** [Any errors in browser console]
```
