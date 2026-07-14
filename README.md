# Signal / Filter Go — Design Demo Build

This project runs as a **frontend-only design demo**. All backend API calls and Auth0 SSO have been replaced with local mock data, so you can click through the app without any backend services, credentials, or network access.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then click **Login SSO** on the login screen. You will be signed in instantly as a demo Franchise Owner with full module access.

## How Mocking Works

- **HTTP layer**: `src/helper/axios/index.js` routes all service calls through `src/helper/mockData/urlRouter.js`, which returns data from `src/stubbedData/` and in-memory stores.
- **Auth**: `src/app/public/pages/login/login.jsx` uses a one-click mock login with a generated JWT (no Auth0).
- **File uploads**: Azure Blob uploads are mocked locally via object URLs in `src/helper/utilityFunctions.js`.

## Environment

Copy `.env.example` to `.env` for local branding/tenant config. No API base URLs are required for the demo.

## Switching branding (Filter Go vs Signal)

On localhost you can switch tenants in two ways:

1. **Sidebar switcher** (expanded sidebar): use the **Filter Go** / **Signal** buttons at the bottom. The page reloads with the selected brand.

2. **`.env` default**: set `REACT_APP_TENANT` to `filter-go.com` or `teamsignal.com`.

### What changes per tenant

| | Filter Go | Signal |
|---|-----------|--------|
| Primary color | Green `#2DA551` | Blue `#146DFF` |
| Logo | Filter Go PNG | Bundled Signal SVG |
| Loader | Filter Go Lottie | Signal Lottie |
| Mock dashboard KPIs | Lower volume demo stats | Higher volume demo stats |
| Mock user / franchise | `demo.owner@filtergo.com` | `demo.owner@teamsignal.com` |
| Login FAQ | Hidden | Shown |

Shared features use the same routes and UI; tenant-specific mock payloads live in `src/helper/mockData/tenantMockData.js`. Theme tokens live in `src/theme/tenantBranding.js`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `build/` |
| `npm run preview` | Preview production build |

## Notes

- Jest tests that relied on MSW/axios against real HTTP patterns may need a separate update pass.
- The Sales module pages (`src/app/sales/pages/`) are not present in this checkout; OBX and Home Office flows are the primary demo surface.
