# UI Refinement Plan

## Objective
Update and refine the movie streaming platform interface to make it cleaner, more professional, and more user-focused.

## Changes Required

### 1. HomeScreen.tsx - Remove Unnecessary Sections
- **Remove "Trending Now" section** - This section shows top 5 rated movies
- **Remove "New Releases" section** - This section shows 5 most recent movies
- **Keep "Now Showing" and "Coming Soon" tabs** - These are the main content sections
- **Ensure balanced layout** - No large empty spaces after removing sections

### 2. MovieDetailScreen.tsx - Favorite Button (Already Done)
- The favorite button is already positioned on the left side of the title
- It's already a small 36x36 circular button
- It's subtle and aligned with the movie title
- No changes needed for this component

### 3. ProfileScreen.tsx - Update Profile Section
- **Remove "Settings" menu item** from the menu list
- **Show actual user activity**:
  - Display actual favorite movies count (instead of "0")
  - Display actual bookings count (instead of "0")
- **Keep these menu items**:
  - Notifications
  - Booking History  
  - Favorites
- Remove Settings from navigation

## Files to Modify

1. `mobile/src/screens/HomeScreen.tsx` - Remove Trending Now and New Releases sections
2. `mobile/src/screens/ProfileScreen.tsx` - Remove Settings, show actual stats

## Implementation Steps

### Step 1: HomeScreen.tsx
- Remove the `trendingNow` useMemo block
- Remove the `newReleases` useMemo block
- Remove the "Trending Now" section rendering (FlatList)
- Remove the "New Releases" section rendering (FlatList)
- Keep only the tabs (Now Showing / Coming Soon) and main movie grid

### Step 2: ProfileScreen.tsx
- Remove "Settings" from menuItems array
- Fetch actual user data (favorites count, bookings count)
- Update statValue displays to show real numbers
- This may require API calls or using AuthContext data

## Expected Result
- Cleaner HomeScreen with only essential movie browsing sections
- Professional ProfileScreen showing actual user engagement
- No empty spaces or unbalanced layouts
