# UI Improvements Plan

## Task Overview
Enhance the mobile app (React Native/Expo) with:
- Gradients and better shadows
- Enhanced components (Button, MovieCard, CinemaCard, SeatPicker)
- Improved screen designs (Login, Register, Home, MovieDetails, Booking, Profile)

---

## Information Gathered

### Current State Analysis:
- **Framework**: React Native with Expo (using expo-linear-gradient)
- **Theme**: Basic dark theme (#000 background, #e50914 primary red)
- **Styling**: Inline StyleSheet objects in each screen
- **Components**: Basic implementations with flat colors and minimal visual effects
- **Animations**: Minimal - mostly static UI

### Files to Modify:
1. `mobile/App.tsx` - Add theme colors/constants
2. `mobile/src/screens/LoginScreen.tsx` - Enhance with gradients
3. `mobile/src/screens/RegisterScreen.tsx` - Enhance with gradients  
4. `mobile/src/screens/HomeScreen.tsx` - Improve cards, header, animations
5. `mobile/src/screens/MovieDetailScreen.tsx` - Better poster, buttons, layout
6. `mobile/src/screens/BookingScreen.tsx` - Enhance cinema cards, seat picker
7. `mobile/src/screens/ProfileScreen.tsx` - Improve profile card, menu items
8. `mobile/src/screens/HistoryScreen.tsx` - Enhance booking cards
9. `mobile/src/screens/FavoritesScreen.tsx` - Improve favorite cards
10. `mobile/src/screens/SearchScreen.tsx` - Enhance search UI
11. `mobile/src/screens/NotificationsScreen.tsx` - Better notification cards

---

## Detailed Plan

### Phase 1: Theme & Base Components (3.1)
- [ ] Add gradient colors and shadow constants to App.tsx
- [ ] Create gradient backgrounds for screen containers
- [ ] Improve shadow effects across all components

### Phase 2: Component Enhancements (3.2-3.5)
- [ ] **Button**: Add gradient buttons with press animations
- [ ] **MovieCard**: Add gradient overlays, shimmer effects, scale on press
- [ ] **CinemaCard**: Add gradient borders, glow effects on selection
- [ ] **SeatPicker**: Add glow effects, better color transitions

### Phase 3: Screen Enhancements

#### 4.1 Login/Register Screens
- [ ] Add gradient background
- [ ] Enhance input fields with focus animations
- [ ] Add floating label effect
- [ ] Improve button with gradient and shadow

#### 4.2 HomeScreen
- [ ] Add hero section with gradient
- [ ] Enhance movie cards with better overlays
- [ ] Add shimmer/loading effects
- [ ] Improve tabs with animated indicators

#### 4.3 MovieDetailsScreen  
- [ ] Add gradient backdrop behind poster
- [ ] Enhance action buttons with gradients
- [ ] Improve layout spacing and typography

#### 4.4 Booking Screens
- [ ] Enhance cinema selection cards
- [ ] Add gradient to seat selection
- [ ] Improve payment method cards
- [ ] Add success animation

#### 4.5 Profile Screens
- [ ] Add gradient header
- [ ] Enhance avatar with gradient border
- [ ] Improve menu items with icons and gradients

---

## Implementation Order

1. First, update `mobile/App.tsx` with theme constants
2. Update each screen in logical order (Login → Home → Details → Booking → Profile)
3. Test each change incrementally

## Dependencies
- Already installed: `expo-linear-gradient` (^15.0.8)
- No new dependencies needed

