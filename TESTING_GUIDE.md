# Testing Guide for Shopping List Sharing Feature

## Overview
This guide explains how to test the new shopping list sharing functionality.

## Prerequisites
1. Run the database migration: `scripts/002_add_sharing.sql`
2. Enable Supabase Realtime for tables: `listas`, `itens_lista`, `lista_compartilhamentos`
3. Have two user accounts for testing

## Test Scenarios

### 1. Get User ID (Both Users)
**Steps:**
1. Log in to the application
2. Click the user profile icon (👤) in the top right corner
3. Copy your User ID
4. Send this ID to the person you want to share with

**Expected Result:**
- Profile dialog opens showing user ID
- ID can be copied with one click
- Copy button shows checkmark when successful

### 2. Share a List (List Creator)
**Steps:**
1. Create or open an existing shopping list
2. Click the share button (🔗) next to the "Add" button
3. Paste the other user's ID in the input field
4. Click "Compartilhar" (Share)

**Expected Result:**
- Share dialog opens
- After sharing, the user appears in "Usuários com acesso" list
- "Compartilhada" badge appears on the list title
- Shared user can now see the list

### 3. View Shared Lists (Shared User)
**Steps:**
1. Log in as the shared user
2. Navigate to the lists page

**Expected Result:**
- Shared list appears with "Compartilhada" badge
- Badge is blue with users icon
- Can click to open the list

### 4. Edit Items in Shared List (Both Users)
**Steps:**
1. Open the shared list
2. Add a new item
3. Check/uncheck existing items
4. Remove an item

**Expected Result:**
- All actions work normally
- Changes appear in real-time for both users
- No page refresh needed to see changes

### 5. Real-time Updates (Both Users)
**Steps:**
1. Both users open the same shared list
2. User A adds an item
3. User B checks an item
4. User A removes an item

**Expected Result:**
- All changes appear instantly for both users
- No need to refresh the page
- Updates are smooth and immediate

### 6. Delete Permission (Test Both Users)
**Steps:**
1. As list creator: Look for delete option
2. As shared user: Look for delete option

**Expected Result:**
- Creator sees delete button
- Shared user does NOT see delete button
- Only creator can delete the list

### 7. Manage Shares (List Creator)
**Steps:**
1. Open share dialog
2. Click "Remover" next to a shared user

**Expected Result:**
- User is removed from shares
- User can no longer access the list
- List disappears from their list view

### 8. Share Dialog Restrictions (Shared User)
**Steps:**
1. Open a shared list (as non-creator)
2. Look for share button

**Expected Result:**
- Share button is NOT visible
- Only creator can manage shares

## Known Limitations

1. **User Discovery**: Users must manually exchange UUIDs. There's no search by email/username yet.
2. **Share Notifications**: No notification when a list is shared with you. Must check lists page.
3. **Permission Levels**: All shared users have full edit access. No read-only mode.

## Troubleshooting

**List not appearing for shared user:**
- Verify RLS policies are applied correctly
- Check that Realtime is enabled
- Confirm the correct user ID was used

**Changes not syncing in real-time:**
- Check Supabase Realtime is enabled for all three tables
- Verify network connection
- Check browser console for errors

**Cannot share list:**
- Ensure you are the list creator
- Verify the user ID is valid and exists
- Check for duplicate shares (already shared with that user)
