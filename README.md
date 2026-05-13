# Fitness and Sports

A Laravel 12 + Inertia React fitness and wellness application with AI-powered nutrition analysis, community engagement, daily health tracking, workout planning, and progress insights.

## Overview

This project combines Laravel backend APIs and Inertia React frontend pages to deliver an interactive fitness dashboard. Users can calculate BMI, log meals with AI-generated nutrition totals, track daily health metrics, explore community posts, join challenges, and view workout and nutrition insights.

## Key Features

- BMI analysis with AI-generated health insights
- AI-powered meal nutrition estimation and meal logging
- Daily health metrics tracking: water, steps, sleep, workout burn
- Fitness community feed with posts, likes, comments, challenges, and events
- Historical meal calorie tracking and monthly progress views
- Nutrition and trends insights with weekly macro summaries
- User profile targets and active burn recommendations driven by AI
- Inertia React frontend with Tailwind CSS and TypeScript

## Tech Stack

- PHP 8.2
- Laravel 12
- Inertia.js with React
- Tailwind CSS v4
- Vite
- Pest PHP for testing
- NVIDIA AI chat completion integration

## Requirements

- PHP 8.2
- Composer
- Node.js and npm
- Git
- NVIDIA API key for AI endpoints

## Setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd Fitness-And-Sports
   ```

2. Install PHP dependencies:

   ```bash
   composer install
   ```

3. Install JavaScript dependencies:

   ```bash
   npm install
   ```

4. Copy environment file and update settings:

   ```bash
   cp .env.example .env
   ```

5. Set the NVIDIA API key in `.env`:

   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```

6. Generate application key and run migrations:

   ```bash
   php artisan key:generate
   php artisan migrate
   ```

## Running the App

Start the application and frontend bundler:

```bash
php artisan serve
npm run dev
```

For the Boost development script:

```bash
composer run dev
```

## Testing

Run Pest tests:

```bash
php artisan test --compact
```

## Development Notes

- API routes are defined in `routes/web.php` and include endpoints for BMI, meals, health metrics, community posts, challenges, and more.
- AI integrations use `config/services.php` under the `nvidia` service key.
- Frontend pages are located in `resources/js/pages` and React components live in `resources/js/components`.
- Eloquent models and controllers are organized inside `app/Models` and `app/Http/Controllers`.

## Environment Variables

Add or verify the following variables in `.env`:

```env
APP_NAME=Fitness and Sports
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost

NVIDIA_API_KEY=your_nvidia_api_key
```

## Notes

- Ensure the NVIDIA API key is valid before using AI-powered endpoints.
- This project leverages Inertia for server-driven page rendering with React components.
- The community module supports public browsing and authenticated actions.
