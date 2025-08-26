# Authentication System Setup

This document explains the new authentication system for the Cleaning Manager app.

## Overview

The app now includes a complete authentication system with role-based access control:

- **Sign In/Sign Up Page**: Modern, iOS-native design
- **Role-Based Routing**: Different dashboards for admins and cleaners
- **Firebase Authentication**: Secure user management
- **Mobile-First Design**: Optimized for iPhone and web

## User Roles

### Admin
- Access to full management dashboard
- Calendar view for bookings
- Cleaner management
- Availability management
- Migration tools

### Cleaner
- View upcoming shifts for the current month
- Set availability for the next month
- Simple, focused interface

## Setup Instructions

### 1. Firebase Authentication Setup

1. Go to your Firebase Console
2. Navigate to Authentication > Sign-in method
3. Enable Email/Password authentication
4. Add your domain to authorized domains

### 2. Firestore Security Rules

Update your Firestore security rules to include user authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all user data
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections (bookings, cleaners, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Add Sample Users (Optional)

Run the sample user script to add test accounts:

```bash
node add-sample-users.js
```

This will create sample users in Firestore. You'll still need to create Firebase Auth accounts manually or use the signup form.

### 4. Test Accounts

After running the sample script, you can create Firebase Auth accounts with these emails:

- `admin@cleaningmanager.com` (Admin role)
- `cleaner1@cleaningmanager.com` (Cleaner role)
- `cleaner2@cleaningmanager.com` (Cleaner role)
- `cleaner3@cleaningmanager.com` (Cleaner role)

## App Structure

### Routes
- `/signin` - Authentication page
- `/admin` - Admin dashboard (protected)
- `/cleaner` - Cleaner dashboard (protected)
- `/` - Redirects based on user role

### Key Components

#### Authentication
- `useAuth` hook - Manages authentication state
- `AuthWrapper` - Protects routes based on user role
- `SignIn` - Modern sign-in/sign-up page

#### Dashboards
- `AdminDashboard` - Full management interface
- `CleanerDashboard` - Focused cleaner interface

#### Styling
- iOS-native design with custom CSS classes
- Mobile-optimized touch targets
- Safe area support for iPhone
- Responsive design for web and mobile

## Features

### Sign In Page
- Clean, modern design
- Tabbed interface for sign in/sign up
- Role selection during signup
- Password visibility toggle
- Loading states and error handling
- iOS-native styling

### Cleaner Dashboard
- **Upcoming Shifts Tab**: Shows assigned cleaning tasks
- **Availability Tab**: Calendar for setting next month's availability
- Clean, card-based design
- Status indicators for tasks

### Admin Dashboard
- Full access to existing features
- Role-based access control
- Modern header with user info
- Sign out functionality

## Mobile Optimizations

### iOS Native Features
- Safe area insets for iPhone
- iOS-style rounded corners
- Native button press effects
- Blur effects and gradients
- Proper touch targets (44px minimum)
- iOS-style typography

### Responsive Design
- Works on both mobile and desktop
- Adaptive layouts
- Touch-friendly interactions
- Optimized for different screen sizes

## Security

- Firebase Authentication for secure login
- Role-based access control
- Protected routes
- Secure password handling
- Session management

## Development

### Adding New Features
1. Use the `useAuth` hook to access user data
2. Wrap components with `AuthWrapper` for protection
3. Use iOS-native CSS classes for styling
4. Test on both mobile and desktop

### Styling Guidelines
- Use `ios-*` classes for iOS-native styling
- Include safe area classes for mobile
- Use `ios-press` for button interactions
- Apply `ios-rounded` for consistent corners
- Use `ios-shadow` for depth

## Troubleshooting

### Common Issues
1. **Authentication not working**: Check Firebase Auth setup
2. **Role-based routing issues**: Verify Firestore user data
3. **Styling not applied**: Ensure CSS classes are imported
4. **Mobile display issues**: Check safe area classes

### Debug Mode
Enable debug logging by adding to your environment:
```
VITE_DEBUG_AUTH=true
```

This will log authentication state changes to the console.
