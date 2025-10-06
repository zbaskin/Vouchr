# Vouchr

Vouchr is a personal collection app for your movie life—save screenings, formats, theaters, and notes; then share a profile that actually feels like *you*. Built with AWS Amplify, React + TypeScript, and a GraphQL backend.

## ✨ Features

- **Ticket Collection** – Add, view, and sort your tickets (`Newest`, `Event Date`, `Title A–Z`).
- **Mobile-first Navbars** – Compact, accessible sheet menus on small screens (opaque panels, no collisions).
- **Landing Page** – Marketing site with hero, feature sections, and CTA.
- **Settings** – App preferences (e.g., default sort).
- **Auth** – Amplify authentication (Sign in/Sign out).
- **Routing** – `react-router-dom` with deep links; sort state encoded as a query param (`?sort=...`).

## 🧰 Tech Stack

- **Frontend:** React 18, TypeScript, Vite (adjust if CRA), utility-first CSS (plus plain CSS files)
- **State/Routes:** `react-router-dom`
- **Backend:** AWS Amplify (Auth, API, Hosting), GraphQL (Amplify codegen models)
- **Icons/Animations:** `lucide-react`, `framer-motion`

## 📁 Project Structure (high level)

```
src/
  components/
    Navbar.tsx
    Navbar.css
  pages/
    LandingPage.tsx
    LandingPage.css
  app/
    AppShell.tsx
    AppShell.css
  assets/
    gold-logo.png
    red-logo.png
  API.ts            # Amplify-generated types (SortType, models, etc.)
  main.tsx          # App bootstrap
  index.css         # Global CSS/variables
amplify/            # Amplify backend resources (envs, schema)
```

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Yarn or npm
- AWS account + Amplify CLI (`npm i -g @aws-amplify/cli`)
- (Optional) GitHub connection for Amplify Hosting

### 1) Clone and install
```bash
git clone https://github.com/zbaskin/Vouchr.git
cd Vouchr
npm install
# or
yarn
```

### 2) Configure Amplify
If you already have a backend:
```bash
amplify pull --appId <APP_ID> --envName <ENV_NAME>
```

Or initialize a new one:
```bash
amplify init
amplify add auth
amplify add api   # GraphQL
amplify push
```

Run codegen if models/types are present:
```bash
amplify codegen
```

### 3) Environment variables
Create `.env` (or `.env.local`) with Amplify outputs (Vite example):
```bash
VITE_AWS_PROJECT_REGION=...
VITE_AWS_COGNITO_IDENTITY_POOL_ID=...
VITE_AWS_COGNITO_REGION=...
VITE_AWS_USER_POOLS_ID=...
VITE_AWS_USER_POOLS_WEB_CLIENT_ID=...
VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT=...
VITE_AWS_APPSYNC_REGION=...
VITE_AWS_APPSYNC_AUTHENTICATION_TYPE=AMAZON_COGNITO_USER_POOLS
```

### 4) Run locally
```bash
npm run dev
# or
yarn dev
```
App defaults to `http://localhost:5173` (adjust for your dev server).

## 🧭 Key Routes

- `/` – Landing page (public)
- `/login` – Auth entry (Amplify UI or custom)
- `/app/collection?sort=<TIME_CREATED|EVENT_DATE|ALPHABETICAL>` – Main collection
- `/app/new` – Add Ticket
- `/app/settings` – Preferences

> The **sort** value is preserved via URL query params. The navbar uses it when navigating back to Collection.

## 🧩 UI & Styling Notes

### Mobile menus (Landing + App)
- Both navbars switch to an **off-canvas sheet** menu on small screens.
- **Opaque** panels (solid white or solid dark) so background never bleeds through.
- Body scroll locks when open; closes on **Esc**, backdrop click, or the Close (X) button.
- “Sort by” becomes a full-width `<select>` inside the sheet on mobile.
- Active links get clear visual states; tab/focus navigation is supported.

### Design tokens
Common CSS variables you can tune (typically in `index.css`):
- `--primary`, `--primary-fg`
- `--secondary-content` (use sparingly in panels—prefer high-contrast text)
- `--surface`, `--surface-2`
- `--border`, `--muted`

## ♿ Accessibility

- Semantic roles for menus (`menubar`, `dialog`) and `aria-modal`.
- Keyboard-close support (`Escape`) for mobile sheets.
- Large tap targets and visible focus states.
- Color contrast enforced for mobile menus (light/dark overrides).

## 🔧 Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build locally
```

## 📦 Deploy (Amplify Hosting)

1. Push the repo to GitHub.
2. In Amplify Console: **New app → Host web app**, connect the repo/branch.
3. Set environment variables to match `.env` if needed.
4. SPA rewrites:
   - Source: `</^((?!\.(css|js|png|jpg|svg|ico)).)*$/>` → Target: `/index.html` (200)
   - Add passthrough rules for static assets as needed.

**Note:** If you see a “branch already exists” error during infra deploy, ensure the Amplify app/branch pair isn’t already created—or update your stack to reference the existing branch.

## 🧪 Troubleshooting

- **`useNavigate` / `useContext` null error**  
  Components using router hooks must render **inside** `<BrowserRouter>`. Verify your tree in `main.tsx`.

- **Sort resetting to `TIME_CREATED`**  
  Ensure you parse `?sort=...` on mount and pass it into your navbar/state when navigating back to `/app/collection`. Keep the value in state and mirror it to the URL.

- **Mobile menu text looks “washed out”**  
  The `.mobileMenuPanel` enforces high-contrast text/background. Don’t set `--secondary-content` (e.g., gold) as the base text color for the whole panel—use it only for accents.

- **Auth type errors (e.g., `AuthEventData`)**  
  Remove unsupported imports or align your types to the installed `@aws-amplify/ui-react` version.

## 🗺️ Roadmap

- Public **profiles** (Ticket Collections)
- **Activity feed** when friends add tickets
- **Tagging** friends per screening
- Image uploads & theater/format metadata
- Shareable collection links & privacy controls

## 🤝 Contributing

PRs and issues are welcome! Please:
- Keep components typed and accessible.
- Prefer small, focused PRs.
- Run `npm run build` before pushing.

## 📝 License

MIT © Zach Baskin

---

### Credits
Built by Zach Baskin. Icons by `lucide-react`. Hosting & backend by AWS Amplify.
