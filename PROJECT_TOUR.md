# Dispatch Merchant Dashboard - Project Tour

This file describes the merchant dashboard project structure, backend route handling, UI organization, theme support, and language configuration.

## Overview

`merchant-dashboard` is a Next.js TypeScript application for a logistics platform named **Dispatch**. It is designed to connect merchants with courier providers, provide shipment management, courier selection, delivery tracking, and analytics.

### Key Technologies

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI / ShadCN UI components
- next-intl for localization
- next-themes for theming
- React Context for authentication
- React Query for data fetching
- React Hook Form + Zod for forms
- Framer Motion for animations
- Lucide React for icons

## Project Structure

```
merchant-dashboard/
├── bun.lockb
├── components.json
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── robots.txt
└── src/
    ├── middleware.ts
    ├── app/
    │   ├── index.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── admin/
    │   ├── api/
    │   ├── login/
    │   ├── merchant/
    │   ├── register/page.tsx
    │   └── supervisor/page.tsx
    ├── assets/
    ├── components/
    ├── context/
    ├── hooks/
    ├── intl/
    └── lib/
```

## Root Layout and Providers

The root layout is defined in `src/app/layout.tsx`.

It wraps the entire app with these providers:

- `ThemeConfigProvider` from `src/components/ThemeProvider.tsx`
- `IntlProvider` from `src/intl/IntlProvider.tsx`
- `AuthProvider` from `src/context/AuthContext.tsx`
- Global toasters: `Toaster` and `Sonner`

This means theme, locale, and authentication state are available throughout the app.

## Backend Route Handling

### API routes

The app uses Next.js API route files under `src/app/api/` to proxy requests to a backend service at `https://service.staging.dispattch.dev`.

Each route is implemented in `route.ts` and can handle HTTP methods like `GET`, `POST`, and `PATCH`.

### How requests flow

1. The frontend calls a Next.js API route, e.g. `/api/auth/login`.
2. The API route receives the request and may extract headers or JSON payload.
3. The route forwards the request to the backend service URL.
4. The backend response is returned to the browser with the same or normalized status.

### Example: Login route

File: `src/app/api/auth/login/route.ts`

- Receives `username` and `password` in the POST body
- Forwards the request to `/api/v1/merchants/login` on the backend
- Returns response JSON and status code
- Handles missing fields and network failures

### Example: Merchant profile route

File: `src/app/api/merchant/profile/route.ts`

- Reads `Authorization` header from incoming request
- Calls the backend profile endpoint using that header
- Normalizes profile data using `src/lib/merchantProfile.ts`
- Returns normalized profile JSON
- Handles authentication errors and network errors

### Main API categories

- `auth/`: login, logout, refresh, register
- `merchant/`: profile, couriers, api-keys, logo
- `shipments/`: shipment operations
- `couriers/`: courier details, available couriers, courier logos

## UI Component Organization

### Custom app components

Located in `src/components/`:

- `AuthGuard.tsx`: protects authenticated pages
- `DataTable.tsx`: reusable table component
- `LanguageSwitcher.tsx`: locale switcher UI
- `ShipmentCard.tsx`: card for a shipment summary
- `StatsCard.tsx`: dashboard statistic card
- `StatusBadge.tsx`: status label component
- `ThemeProvider.tsx`: theme provider and context
- `ThemeToggle.tsx`: theme control UI

### ShadCN / Radix UI components

Located in `src/components/ui/`:

- `button.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`
- `card.tsx`, `sidebar.tsx`, `tabs.tsx`, `accordion.tsx`, `dialog.tsx`
- `toast.tsx`, `alert.tsx`, `popover.tsx`, `dropdown-menu.tsx`
- `table.tsx`, `chart.tsx`, `badge.tsx`, `tooltip.tsx`

These components provide accessible UI primitives and consistent design patterns.

### Component design patterns

- Uses `class-variance-authority` for variant styles
- Uses `clsx` and `tailwind-merge` for class composition
- Supports reusable layout, form, data display, and feedback components
- Follows a modular design where `ui/` components are generic and app-specific components are in the top-level `components` folder

## Theme Configuration

### Theme provider

File: `src/components/ThemeProvider.tsx`

This provider wraps `next-themes` and adds a color scheme context with:

- `colorScheme` and `setColorScheme`
- `mode` and `setMode`

It stores preferences in `localStorage` using keys from `src/lib/theme.ts`.

### Theme settings

File: `src/lib/theme.ts`

The theme system defines:

- `ThemeMode`: `dark | light | system`
- `ColorSchemeKey`: keys like `purple`, `blue`, `orange`, `green`, `rose`
- Default values: `DEFAULT_COLOR_SCHEME = "purple"`, `DEFAULT_THEME_MODE = "dark"`
- `THEME_STORAGE_KEYS` used for persistence

Color schemes are defined with HSL values and include:

- `purple`
- `blue`
- `orange`
- `green`
- `rose`

### Theme usage

Components can use the theme context via `useThemeConfig()`.

The UI supports:

- dark/light mode switching
- system theme following
- theme color selection
- persistent user preference storage

## Language / Internationalization

### Intl files

Located in `src/intl/`:

- `en.ts`: English translations
- `am.ts`: Amharic translations
- `index.ts`: exports public API and locales
- `IntlProvider.tsx`: locale provider implementation

### Translation structure

Translations are organized by page and feature, including keys such as:

- `brand`
- `nav`
- `hero`
- `stats`
- `features`
- `howItWorks`
- `portals`
- `cta`
- `footer`

### Using translations

Components call `useI18n(namespace)` and then use keys:

```tsx
const tHero = useI18n("hero");
return <h1>{tHero("headline1")}</h1>;
```

This provides typed access to translation strings.

### Supported locales

- `en` (English)
- `am` (Amharic)

## Authentication Flow

### Auth context

File: `src/context/AuthContext.tsx`

This provider manages:

- `user` information
- `accessToken` and `refreshToken`
- authenticated state and loading state
- token refresh scheduling
- login/logout flows

### Token handling

- Extracts token payload using JWT decoding
- Schedules refresh before token expiry
- Persists tokens in local storage
- Exposes `getValidAccessToken()` for API calls

### Protection

- `AuthGuard.tsx` is used to guard secure routes
- `middleware.ts` likely performs route-level checks and redirects

## App Pages and Layouts

### Landing page

File: `src/app/page.tsx`

- Displays marketing content, hero section, features, stats, and call to action
- Uses translation hooks for all text
- Includes theme and language switchers

### Merchant area

Folder: `src/app/merchant/`

- `layout.tsx`: merchant dashboard sidebar and layout
- `page.tsx`: merchant home/dashboard
- `api-keys/page.tsx`: API key management
- `couriers/`: courier list and detail pages
- `profile/`: merchant profile pages
- `shipments/`: shipment management pages

The merchant layout includes:
- sidebar navigation
- user logout button
- profile logo fetch from merchant profile
- responsive collapse state

### Auth pages

- `src/app/login/[role]/page.tsx`: role-based login
- `src/app/register/page.tsx`: merchant registration

### Admin and supervisor pages

- `src/app/admin/page.tsx`
- `src/app/supervisor/page.tsx`

These are likely role-specific dashboards for admin and supervisor users.

## Utility Libraries

### `src/lib/`

- `auth.ts`: auth helpers and token utilities
- `utils.ts`: general utilities such as class name merging
- `theme.ts`: theme configuration
- `merchantProfile.ts`: normalizes backend merchant profile data
- `shipments.ts`: shipment-related helpers
- `couriers.ts`: courier-related helpers
- `api-keys.ts`: API key helpers
- `keycloak.server.ts`: keycloak integration support

### Custom hooks

Located in `src/hooks/`:

- `use-mobile.tsx`: mobile viewport detection
- `use-toast.ts`: toast notification helper

## Summary

This project is structured for maintainability and scalability. It separates concerns clearly across:

- UI components and shared design primitives
- API proxy routes for backend integration
- theme and locale providers
- authentication context and secure routing

The platform is well suited for a logistics dashboard with merchant and role-based functionality.
