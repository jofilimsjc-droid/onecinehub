# Mobile UI Improvements Plan

## Current State Analysis

### What's Already Good:
- Dark theme with consistent colors (COLORS, GRADIENTS, SHADOWS)
- SafeAreaView usage across screens
- Movie cards with posters, titles, genres
- Tab navigation setup
- Loading states with ActivityIndicator
- Gradient usage for visual appeal

### Issues Identified:
1. **Responsive Layout**: Fixed dimensions like `width: 280` for cards don't scale properly on different screen sizes
2. **Keyboard Avoiding**: Login/Register screens don't properly handle keyboard - missing KeyboardAvoidingView wrapper
3. **Spacing/Margins**: Inconsistent padding (20, 16, 12 mixed) across screens
4. **Button Design**: Inconsistent button styling - some lack proper rounded corners
5. **Loading Indicators**: Basic ActivityIndicator - could be more polished with skeleton/shimmer
6. **Navigation Bar**: Missing custom headers with back buttons on stack screens
7. **Movie Cards**: Good but could have better shadows and tap feedback
8. **Input Fields**: Could have better focus states and consistent styling
9. **Tab Bar**: Basic implementation - could be more polished with better icons
10. **Safe Area**: Some elements may overlap with notch areas on certain phones

## Improvement Plan

### Phase 1: Theme & Constants Enhancement
- [ ] Update `theme.ts` to add responsive sizing based on device dimensions
- [ ] Add responsive breakpoint system (small, medium, large phones)
- [ ] Add consistent spacing scale (xs, sm, md, lg, xl, xxl)
- [ ] Enhance button styles with consistent rounded corners

### Phase 2: App Shell & Navigation
- [ ] Update `App.tsx` - Improve tab bar with better icons and styling
- [ ] Add consistent header component for all stack screens
- [ ] Implement proper KeyboardAvoidingView in Login/Register screens
- [ ] Fix safe area handling across all screens

### Phase 3: Screen Improvements
- [ ] **Login/Register**: Fix keyboard handling, add better input styling
- [ ] **Home**: Improve movie card design with better shadows and spacing
- [ ] **Profile**: Fix menu item icons, improve profile card layout
- [ ] **Booking**: Better step indicator, fix scrolling issues
- [ ] **Favorites/History**: Consistent card design with proper spacing
- [ ] **Notifications**: Better empty state, improve card styling
- [ ] **Search**: Better search bar design, consistent results grid
- [ ] **MovieDetail**: Better poster display, fix button layout

### Phase 4: Component Enhancements
- [ ] Create reusable Button component with consistent styling
- [ ] Create reusable Input component with focus states
- [ ] Create reusable Card component for movie items
- [ ] Create reusable Loading component with better styling
- [ ] Create reusable Header component

### Phase 5: Polish
- [ ] Add haptic feedback for button presses
- [ ] Add smooth animations
- [ ] Improve empty states across all lists
- [ ] Fix any overlapping issues
- [ ] Test on different screen sizes

## Files to Modify

1. `mobile/src/theme.ts` - Add responsive sizing and enhanced constants
2. `mobile/App.tsx` - Improve tab bar and navigation
3. `mobile/src/screens/LoginScreen.tsx` - Fix keyboard handling
4. `mobile/src/screens/RegisterScreen.tsx` - Fix keyboard handling
5. `mobile/src/screens/HomeScreen.tsx` - Improve movie cards and layout
6. `mobile/src/screens/ProfileScreen.tsx` - Improve styling
7. `mobile/src/screens/BookingScreen.tsx` - Fix scrolling and keyboard
8. `mobile/src/screens/FavoritesScreen.tsx` - Improve card design
9. `mobile/src/screens/HistoryScreen.tsx` - Improve card design
10. `mobile/src/screens/NotificationsScreen.tsx` - Improve styling
11. `mobile/src/screens/SearchScreen.tsx` - Improve search bar
12. `mobile/src/screens/MovieDetailScreen.tsx` - Improve layout

## Dependencies
- No new dependencies required - using existing Expo libraries
- All improvements use standard React Native and Expo components

