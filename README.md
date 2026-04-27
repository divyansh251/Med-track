# Med Track

A mobile app to track whether you've taken your medicines each day.

## Features

- **Today tab** – See all your scheduled medicines for the day. Tap any card to mark it as taken/not taken. Shows a live progress bar.
- **Medicines tab** – Add, pause, or delete medicines. Each medicine has a name, dosage, time(s) of day, a color label, and optional notes.
- **History tab** – View the last 7 days with per-day adherence percentages and a 7-day summary.

## Getting started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

### Run the app

```bash
npm install
npx expo start
```

Scan the QR code with:
- **Android**: the Expo Go app
- **iOS**: the Camera app

### Build for device (standalone APK/IPA)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform android   # or ios
```

## Project structure

```
src/
  types/index.ts        # Shared TypeScript types & constants
  storage/storage.ts    # AsyncStorage persistence layer
  utils/date.ts         # Date formatting helpers
  screens/
    HomeScreen.tsx       # Today's dose tracker
    MedicinesScreen.tsx  # Medicine list
    AddMedicineScreen.tsx# Add new medicine form
    HistoryScreen.tsx    # 7-day history
```
