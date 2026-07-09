# Shona Arts — AI-Powered Art Marketplace (Mobile)

University coursework project: a React Native (Expo) + TypeScript mobile app for an
online art marketplace, with a mock in-memory backend so it runs with no server setup.

## Features

**Customer**
- Register / login (mock JWT auth)
- Browse, search, and filter paintings
- Wishlist and cart
- Checkout and order history
- Custom artwork requests
- Profile editing

**Admin**
- Dashboard with live stats
- Manage paintings — full CRUD (add, edit, delete, search)
- Manage orders — view all orders, filter by status, update status, delete
- Manage users — view all users, search, promote/demote role, delete
- Analytics — revenue, order-status breakdown, catalogue by category, top sellers, low-stock alerts

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81 / React 19
- **Language**: TypeScript
- **Navigation**: React Navigation (native-stack + bottom-tabs)
- **State**: Redux Toolkit
- **API client**: Axios (wired for a real backend later)
- **Mock backend**: `src/api/mockApi.ts` — plain in-memory mock, no server required
- **UI**: React Native Paper + `@expo/vector-icons`
- **Storage**: AsyncStorage

## Getting Started

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (make sure your Expo Go app is on SDK 54)
or press `a` / `i` for an emulator/simulator, or `w` for web.

If your project folder lives inside OneDrive/Google Drive, file-sync locks can
corrupt `node_modules` mid-install and cause obscure Metro/npm errors. Move the
project outside any synced folder (e.g. `C:\dev\shona-arts`) before running
`npm install`, or pause syncing for that folder.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@gmail.com | 123456 |
| Admin | admin@gmail.com | 123456 |

## Project Structure

```
shona-arts/
├── App.tsx
├── app.json
├── src/
│   ├── api/          # mockApi.ts (in-memory backend), axios.ts, services.ts
│   ├── components/    # shared UI components
│   ├── constants/
│   ├── mock/data/     # mock users, paintings, orders
│   ├── navigation/
│   ├── redux/          # store + slices
│   ├── screens/
│   ├── theme/
│   ├── types/
│   └── utils/
└── assets/
```

## Troubleshooting

**Metro/Expo Go can't connect** — try `npx expo start --tunnel` if your phone
and computer aren't on the same network.

**Dependency or version errors** — delete `node_modules` and `package-lock.json`,
then run `npm install` again. Run `npx expo-doctor` to check your dependency
versions against the installed Expo SDK.

**Stale bundler cache** — `npx expo start --clear`
