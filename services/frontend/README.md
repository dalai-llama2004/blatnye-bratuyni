# Coworking Booking System - Frontend

Modern Next.js (TypeScript) MVP frontend for the coworking booking system.

## Features

- User registration with email confirmation
- Login and authentication
- Password recovery and reset
- View zones, places, and available time slots
- Book, cancel, and extend bookings
- View booking history
- Basic admin interface
- Clean, modern UX inspired by prostospb.team

## Tech Stack

- **Next.js 14** - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Axios** - HTTP client for API calls
- **CSS Modules** - Scoped component styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
services/frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Input.tsx
│   ├── pages/          # Next.js pages (routes)
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── register.tsx
│   │   ├── confirm.tsx
│   │   ├── login.tsx
│   │   ├── recover.tsx
│   │   ├── reset.tsx
│   │   └── zones.tsx
│   ├── styles/         # Global styles
│   │   └── globals.css
│   └── utils/          # Utilities
│       └── api.ts      # API client
├── public/             # Static assets
│   └── logo.svg
├── package.json
├── tsconfig.json
└── next.config.js
```

## API Integration

The frontend communicates with the backend through the API Gateway. Configure the API base URL in `src/utils/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Available Pages

- `/` - Home page
- `/register` - User registration
- `/confirm` - Email confirmation
- `/login` - User login
- `/recover` - Password recovery
- `/reset` - Password reset
- `/zones` - View zones and make bookings
- `/bookings` - View booking history

## Development

The application is designed to work independently from the backend services. It makes HTTP requests to the API Gateway endpoints as defined in the technical documentation.

### Key API Endpoints

- `POST /users/register` - Register new user
- `POST /users/confirm` - Confirm email
- `POST /users/login` - User login
- `POST /users/recover` - Request password reset
- `POST /users/reset` - Reset password
- `GET /zones` - List all zones
- `GET /zones/{id}/places` - List places in zone
- `GET /places/{id}/slots` - Get available slots
- `POST /bookings` - Create booking
- `POST /bookings/cancel` - Cancel booking
- `GET /bookings/history` - View booking history

## License

This project is part of the distributed systems course at Innopolis University.
