# My Fitness

An Expo fitness tracker with workout planning, meal logging, daily nutrition goals, and an OpenAI-powered meal photo analysis backend.

## Features

- Workout day, exercise, and set planning with local persistence.
- Meal logging with optional photo analysis through the backend.
- Daily calorie and protein goals.
- Today dashboard and history views.
- Persisted light, dark, and system theme modes for phone and desktop use.

## Project Structure

- `myFitnessFrontend` - Expo Router mobile/web app.
- `myFitnessBackend` - Express API for meal image analysis.

## Local Setup

From this directory, install dependencies in both projects:

   ```bash
   cd myFitnessBackend
   npm install
   cd ../myFitnessFrontend
   npm install
   cd ..
   ```

Configure backend secrets:

   ```bash
   cp myFitnessBackend/.env.example myFitnessBackend/.env
   ```

   Add your `OPENAI_API_KEY` in `myFitnessBackend/.env`.

Configure the frontend API URL:

   ```bash
   cp myFitnessFrontend/.env.example myFitnessFrontend/.env
   ```

   For Expo Go on a physical phone, replace `localhost` with your computer's LAN IP, for example `http://192.168.1.20:3001`.

Start the backend:

   ```bash
   cd myFitnessBackend
   npm start
   ```

Start the app:

   ```bash
   cd myFitnessFrontend
   npm start
   ```

## Checks

Run these before shipping:

```bash
cd myFitnessFrontend
npm run lint
npx tsc --noEmit
npx expo export --platform web

cd ../myFitnessBackend
npm run check
```

## Launch Notes

- The backend must be deployed somewhere reachable by the app, then set `EXPO_PUBLIC_API_URL` to that deployed origin.
- The backend needs `OPENAI_API_KEY` in its runtime environment.
- The current app stores workout and food data locally with AsyncStorage.
- Pushes to `main` automatically check, export, and deploy the website to GitHub Pages.
- The production website is configured for the `/myFitnessApp` repository path.

## Render Backend

The root `render.yaml` deploys `myFitnessBackend` as a free Render web service.

1. In Render, create a Blueprint from this GitHub repository.
2. Enter `OPENAI_API_KEY` when Render requests the secret value.
3. After deployment, set the GitHub Actions repository variable
   `EXPO_PUBLIC_API_URL` to the Render service origin, without a trailing slash.
4. Run the `Deploy website` workflow again so GitHub Pages includes the API URL.

The free Render service sleeps after 15 minutes without traffic. The first meal
analysis after that can take about a minute longer while the service wakes up.
