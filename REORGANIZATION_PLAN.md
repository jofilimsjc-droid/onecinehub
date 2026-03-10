# Project Reorganization Plan

## Current Structure Analysis

### Issues Identified:
1. **Flat file structure** - All PHP files in root directory
2. **Mixed concerns** - PHP logic, HTML, CSS, JS all in same files
3. **Code duplication** - Inline styles, repeated CSS classes across files
4. **No MVC pattern** - Business logic mixed with views
5. **Scattered assets** - No organized asset directory

### Current File Count (Web):
- 15+ PHP files in root
- Multiple CSS/JS files
- No proper separation

### Mobile App Status:
- Already well-structured with proper directories
- Uses TypeScript with proper typing
- Has context/providers pattern

---

## Proposed Reorganization

### 1. Create PHP Backend Structure
```
php/
├── config/
│   ├── database.php      # Database connection
│   └── constants.php    # App constants
├── controllers/         # Business logic
│   ├── AuthController.php
│   ├── MovieController.php
│   ├── BookingController.php
│   ├── UserController.php
│   └── AdminController.php
├── models/              # Data models
│   ├── Movie.php
│   ├── User.php
│   ├── Booking.php
│   ├── Cinema.php
│   └── Notification.php
├── helpers/            # Utility functions
│   ├── functions.php
│   └── validator.php
└── api/                # API handlers
    └── routes.php
```

### 2. Create Web Views Structure
```
web/
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── admin.css
│   │   └── components.css
│   ├── js/
│   │   ├── main.js
│   │   ├── admin.js
│   │   ├── booking.js
│   │   └── utils.js
│   └── images/
├── layouts/
│   ├── header.php
│   ├── footer.php
│   └── admin-layout.php
├── pages/
│   ├── home.php
│   ├── dashboard.php
│   ├── booking.php
│   ├── movie-details.php
│   └── auth/
│       ├── login.php
│       └── register.php
└── admin/
    ├── dashboard.php
    ├── movies.php
    ├── schedules.php
    ├── cinemas.php
    └── users.php
```

### 3. Root Files (Entry Points)
```
root/
├── index.php           # Home page (imports from web/)
├── dashboard.php       # User dashboard (imports from web/)
├── booking.php         # Booking page (imports from web/)
├── movie_details.php   # Movie details (imports from web/)
├── admin.php           # Admin login (imports from web/admin/)
├── admin_dashboard.php # Admin dashboard (imports from web/admin/)
├── api.php             # API entry (imports from php/api/)
└── auth.php            # Auth handler (imports from php/controllers/)
```

### 4. Keep Mobile Structure (Already Good)
```
mobile/
├── src/
│   ├── screens/
│   ├── context/
│   ├── types/
│   ├── utils/
│   └── theme.ts
└── App.tsx
```

---

## Benefits of This Reorganization

1. **Scalability** - Easy to add new features
2. **Maintainability** - Changes in one place don't affect others
3. **Reusability** - Controllers/Models can be used by both web and mobile
4. **Professional** - Follows industry best practices
5. **Testability** - Easier to write unit tests
6. **Collaboration** - Team members can work on different modules

---

## Implementation Priority

### Phase 1: Core Structure (High Priority)
1. Create directory structure
2. Move/configure database connection
3. Create base controllers

### Phase 2: Code Migration (Medium Priority)
1. Move CSS to assets/css/
2. Move JS to assets/js/
3. Create layout templates
4. Update file references

### Phase 3: Refactoring (Lower Priority)
1. Extract inline styles to CSS
2. Remove code duplication
3. Add comments/documentation

---

## Files to Modify
- All PHP files need path updates
- CSS/JS references need updating
- Configuration paths need updating

## Backward Compatibility
- Keep existing functionality
- Use include/require with new paths
- Test each page after migration

