# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server
npm run dev              # Starts Astro dev server on localhost:4321

# Build and checks
npm run build           # Full build with type checking
npm run build:vercel    # Build specifically for Vercel deployment
npm run preview         # Preview production build locally

# Code quality
npm run lint            # ESLint check
npm run format          # Prettier formatting
npm run security:check  # Custom security validation
```

### Testing
```bash
# Test commands
npm run test            # Run tests with Vitest
npm run test:ui         # Run tests with UI
npm run test:run        # Run tests once (CI mode)
npm run test:coverage   # Run tests with coverage report
npm run test:watch      # Run tests in watch mode
```

### Firebase Functions
```bash
# Functions development (run from functions/ directory)
cd functions
npm run build           # Build TypeScript to JavaScript
npm run build:watch     # Build in watch mode
npm run serve           # Start local emulators
npm run deploy          # Deploy functions to Firebase
npm run logs            # View function logs
```

### Pre-deployment
```bash
npm run pre-deploy      # Run all checks: lint, security, test, build
```

## Architecture Overview

### Tech Stack
- **Frontend**: Astro + React + TypeScript
- **Styling**: Tailwind CSS with custom components
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Email**: Mailgun via Firebase Functions
- **Hosting**: Vercel (with Firebase Functions as API)
- **Testing**: Vitest + Testing Library

### Project Structure

#### Feature-Based Architecture
The codebase uses a **feature-based architecture** in `src/features/`:
- **admin/** - Admin panel functionality, settings, sync controls
- **blog/** - Article management, CRUD operations  
- **newsletter/** - Subscriber management, email services

Each feature contains:
- `*Service.ts` - Firebase data layer and business logic
- `index.ts` - Public API exports
- React components when needed

#### Core Architecture
- **src/core/** - Shared application core
  - `config/` - Centralized environment configuration
  - `firebase/` - Firebase initialization and utilities
  - `auth/` - Authentication hooks and utilities
  - `stores/` - Global state management
  - `types/` - Shared TypeScript types

#### Component Organization
- **src/components/** - Shared UI components
- **src/layouts/** - Page layout components
- **src/pages/** - Astro pages and API routes

### Configuration Management

#### Environment Variables
The project uses a centralized configuration system in `src/core/config/index.ts`:
- Validates required environment variables
- Provides type-safe configuration access
- Handles different environments (dev/prod)
- See `ENV_VARIABLES.md` for complete setup

#### Key Configuration Features
- **Admin Email Management**: Centralized admin user validation
- **Firebase Config**: Type-safe Firebase initialization
- **Environment Detection**: Automatic dev/prod environment handling
- **CORS Configuration**: Configurable allowed origins

### Firebase Integration

#### Client-side (`src/core/firebase/config.ts`)
- Firebase app initialization with environment-based config
- Firestore, Auth, Storage, and Functions setup
- Admin user utilities via `firebaseUtils.isUserAdmin()`

#### Server-side (`functions/src/`)
- Firebase Functions for email services
- Mailgun integration for newsletters
- Content synchronization between Astro and Firestore
- Admin-only protected endpoints

### Authentication & Authorization
- **Firebase Auth**: Email/password authentication
- **Admin Protection**: Component-level admin route protection
- **Role-based Access**: Email-based admin validation
- **Persistent Sessions**: Local storage persistence

### Testing Strategy
- **Vitest Configuration**: `vitest.config.ts` with jsdom environment
- **Coverage Thresholds**: 70% minimum coverage requirement
- **Test Environment**: Isolated test Firebase config
- **Component Testing**: React Testing Library integration

## Development Guidelines

### Running the Project
1. Install dependencies: `npm install`
2. Setup environment variables (see `ENV_VARIABLES.md`)
3. Start development: `npm run dev`
4. For Firebase Functions: `cd functions && npm run serve`

### Making Changes
1. Always run `npm run lint` before committing
2. Use `npm run security:check` to validate security
3. Run `npm run test` to ensure tests pass
4. Use `npm run pre-deploy` before any deployment

### Feature Development
- Create new features in `src/features/[featureName]/`
- Include service layer for data operations
- Add index.ts for clean exports
- Use existing Firebase patterns for consistency

### Firebase Functions
- Functions are in TypeScript: `functions/src/`
- Build with `npm run build` in functions directory
- Test locally with Firebase emulators
- Deploy with `npm run deploy` (from functions directory)

### Security Notes
- Never commit environment variables
- Use `SECURITY_SETUP.md` for security configuration
- Admin emails are configured via environment variables
- All Firebase rules are defined in `firestore.rules`