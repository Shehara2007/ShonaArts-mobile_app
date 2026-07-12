# Shona Arts — Art Marketplace App

A mobile app (built with Expo/React Native) for buying paintings online. It has
a customer side (browse, buy, review) and an admin side (manage paintings,
orders, users). Everything runs with **no backend server** — all data is
mocked in memory, so you can clone it and run it immediately.

---

## Features

**Customer**
- Sign up / log in
- Browse and search paintings, filter by category
- View painting details, leave a star rating + review
- Add to wishlist or cart, checkout, view order history
- Cancel a pending order
- Request a custom painting (with a reference photo)
- Get notifications (order updates, etc.)
- Edit profile & photo, change password, delete account

**Admin**
- Dashboard with sales stats
- Add / edit / delete paintings (with camera or gallery photo upload)
- View and manage all orders
- View and manage all users
- Analytics (revenue, top sellers, low stock)

---

## Tech Stack

- **Expo** (React Native) + **TypeScript**
- **Redux Toolkit** for app state
- **React Navigation** for screens/tabs
- Mock backend — no server, no database, no API keys needed

---

## Getting Started

**Requirements:** Node.js installed, and the **Expo Go** app on your phone
(or a simulator/emulator on your computer).

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `a` (Android), `i` (iOS), or `w`
(web) in the terminal.

> If your project folder is inside OneDrive/Google Drive, move it out first —
> synced folders can corrupt `node_modules` during install.

---

## Demo Login

| Role | Email | Password |
|---|---|---|
| Customer | customer@gmail.com | 123456 |
| Admin | admin@gmail.com | 123456 |

Note: all data resets when you reload the app, since there's no real database.

---

## Project Structure

```
shona-arts/
├── App.tsx              # App entry point
├── app.json              # Expo config (permissions, icons, etc.)
└── src/
    ├── api/               # Mock backend + service functions
    ├── components/        # Reusable UI pieces (buttons, cards, etc.)
    ├── mock/data/          # Sample users, paintings, orders
    ├── navigation/         # App navigation setup
    ├── redux/              # App state
    ├── screens/            # All app screens (customer + admin)
    ├── theme/              # Colors, fonts, spacing
    └── types/              # TypeScript types
```

---

## Camera & Photo Access

The app asks for camera/gallery permission when:
- An admin adds/edits a painting photo
- A customer changes their profile photo or attaches a photo to a custom
  request

This is already configured in `app.json` — no extra setup needed.

---

## Useful Commands

```bash
npm start          # Start the app
npm run android    # Start and open on Android
npm run ios        # Start and open on iOS
npx tsc --noEmit   # Check for TypeScript errors
```

---

## Troubleshooting

- **Can't connect from phone** → run `npx expo start --tunnel`
- **Weird errors after installing** → delete `node_modules` and
  `package-lock.json`, then run `npm install` again
- **Blank/stale screen** → run `npx expo start --clear`
- **Camera/gallery not opening** → check you allowed permission when
  prompted (or re-enable it in your phone's Settings app)

