# My Fitness Frontend

Expo Router app for workout planning, food logging, daily nutrition progress, history, and persisted light/dark/system theme modes.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_API_URL` in `.env` to the backend origin. Use `http://localhost:3001` for local web development. Use your computer's LAN IP when testing with Expo Go on a phone.

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
npx expo export --platform web
```

## Website deployment

The app exports static routes with a `/myFitnessApp` base path. The repository's
GitHub Pages workflow builds and publishes `dist` whenever frontend changes are
pushed to `main`.
