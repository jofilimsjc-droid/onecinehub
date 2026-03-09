# ONECINEHUB Mobile App

React Native + Expo mobile app for ONECINEHUB cinema booking.

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Use Node 20 LTS** (required for Expo SDK 54):
   - Current error you may see on Windows with Node 25: Metro watch `ENOENT` / crashes
   - Install Node **20.19.x** LTS, then reopen terminal

3. **Configure API URL** - Edit `src/config.ts`:
   - **Expo Go on physical device**: Use your computer's local IP (e.g. `http://192.168.1.100/onecinehub`)
   - **Android Emulator**: Use `http://10.0.2.2/onecinehub`
   - **iOS Simulator / localhost**: Use `http://localhost/onecinehub`

4. **Run PHP backend** - Make sure your OneCineHub PHP server is running (XAMPP, WAMP, or similar).

5. **Start the app**:
   ```bash
   npx expo start
   ```

6. **Open in Expo Go** - Scan the QR code with Expo Go app on your phone (same WiFi as computer).

## Features

- **Login / Register** - Token-based auth (Gmail only for register)
- **Browse Movies** - Now Showing & Coming Soon
- **Movie Details** - Synopsis, cast, watch trailer
- **Book Tickets** - Select cinema → date → time → seats → confirm
- **Profile** - View account, booking history, favorites
- **Favorites** - Save movies (requires login)

## Backend Requirements

The PHP backend needs:
- `api-mobile.php` - Mobile login/register (creates `user_tokens` table automatically)
- `api.php` - Updated with `check_auth`, CORS headers, token auth support
- `config.php` - Updated `isLoggedIn()` to support `X-Auth-Token` header

## Troubleshooting

- **Network error**: Ensure API URL in `src/config.ts` matches your server. Use your computer's IP, not localhost, when testing on a real device.
- **Login fails**: Check that `api-mobile.php` is accessible and the database has the `user_tokens` table (created automatically on first login).
