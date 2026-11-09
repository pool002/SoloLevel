# Shadow Monarch Leveling System
### Technical Architecture & System Wiki

Welcome to the official developer documentation and technical wiki for the **Shadow Monarch Leveling System**. This document outlines the system architecture, network topology, rendering paradigms, API specifications, security practices, and future upgrade roadmaps.

---

## 1. Executive Summary & Application Overview
The **Shadow Monarch Leveling System** is a full-stack, gamified daily productivity application inspired by the *Solo Leveling* anime and web novel. Users track real-world routines (e.g., workouts, coding, deep study, hydration) and receive in-game rewards like Experience Points (XP), Gold, Stat Points, and Artifacts.

The system features real-time rank progression, customized weekly targets, persistent state saving, dynamic penances for targets unmet, and an interactive mystery loot-box mechanism.

---

## 2. Network Architecture & Ingress Routing
The application operates in a containerized environment with the following networking configuration:

```
+------------------------------------------------------------+
|                       CONTAINER INGRESS                    |
|                                                            |
|  [External Client Request] ---> Port 443 (HTTPS Web App)   |
|                                       |                    |
|                                       v                    |
|  [NGINX Reverse Proxy]    ---> Port 3000 (Internal Port)   |
|                                       |                    |
|                                       v                    |
|  [Full-Stack Express App] ---> Bound to Host 0.0.0.0:3000  |
+------------------------------------------------------------+
```

### Key Architectural Constraints:
* **Ingress Restriction**: Port `3000` is the **only** externally reachable port of the container. All incoming traffic is routed to port 3000 by the infrastructure's NGINX reverse proxy.
* **Server Binding**: The Express server binds explicitly to host `0.0.0.0` to permit proper container network interfaces to discover the listener.
* **HMR Disablement**: Hot Module Replacement (HMR) is disabled in the development environment (`DISABLE_HMR=true`) to avoid flickering or partial-rendered state corruption during progressive file updates.

---

## 3. Full-Stack Runtimes & Dev/Build Workflows

The application utilizes a **unified full-stack layout** (Express serving as both the static file server and the backend controller).

### Development Workflow (`npm run dev`)
Runs via `tsx server.ts`.
* In development, **Vite is mounted dynamically** as an Express middleware using `createViteServer` with `middlewareMode: true` and `appType: "spa"`.
* The server intercepts backend-specific API calls (`/api/*` or static routes like `/uploads/*`) first, and delegating any other client-side routing and module loading directly to the Vite compiler.

### Production Compiling & Bundling Workflow (`npm run build`)
To prevent runtime ES Module relative import resolution conflicts inside the production environment, the compilation process is optimized using a dual-bundling technique:
1. **Client Bundling**: `vite build` builds the front-end code into highly optimized static assets (HTML, JS, CSS) placed under the `dist/` directory.
2. **Server Bundling**: `esbuild server.ts --bundle --platform=node --format=cjs ...` packages the Express backend into a **single self-contained CommonJS file** (`dist/server.cjs`). All relative imports are compiled during build-time, while external dependencies (e.g., `express`, `multer`) are kept external.
3. **Execution (`npm start`)**: The compiled artifact is executed natively using Node: `node dist/server.cjs`, enabling near-instant startup speeds and clean environment integration.

---

## 4. UI Rendering & Client-Side Architecture

The interface follows a bespoke, high-contrast, holographic tactical command deck aesthetic.

* **Rendering Engine**: React 18+ with TypeScript.
* **Styling Strategy**: Tailwind CSS v4 utility classes. Responsive, mobile-first fluid grids constructed with `w-full max-w-7xl mx-auto` containers to secure desktop elegance.
* **Icons**: Standardized using `lucide-react`. No raw SVG or foreign icon libraries are permitted.
* **Transitions**: Powered by `motion` (imported from `motion/react`) for smooth micro-interactions, modal fade-ins, and floating rank cards.

---

## 5. Storage, State Management, & Persistence

Data is persisted dynamically depending on complexity and lifespan:

```
+-----------------------------------------------------------------------------------+
|                                  STATE PERSISTENCE                                |
|                                                                                   |
|  [User Session (In-Memory)] ---> Cached dynamically in React Component state     |
|                                       |                                           |
|                                       v                                           |
|  [LocalStorage (Client)]    ---> Saved as JSON to 'solo_leveling_system_v3_state' |
|                                  (Provides zero-latency, offline availability)    |
|                                       |                                           |
|                                       v                                           |
|  [File System (Server-Side)] ---> Saved binary uploads securely to /uploads/     |
+-----------------------------------------------------------------------------------+
```

### In-Memory Weekly Purging Protocols
To prevent client-side storage bloat and optimize memory footprints:
* **Fine-Grained Active Logs**: Complete daily task multiplier logs are kept in-memory for the *active calendar week only*.
* **Historical Weekly Summaries**: On Sunday (or upon starting a new week), old daily scores are purged from memory, leaving only condensed historical records in `weeklyTargets` (containing the week ending date, points achieved, goals met, and penalty parameters).

---

## 6. Secure Media Upload & File Handling
The system handles user avatar uploads securely using `multer` on the server-side container.

### API Endpoint Specification

#### `POST /api/upload-avatar`
* **Purpose**: Uploads and validates an Awakened user's profile picture.
* **Request Format**: `multipart/form-data`
* **Expected Field**: `avatar` (file payload)
* **Server Constraints**:
  * Allowed extensions: Strictly `.jpg`, `.jpeg`, and `.png` (case-insensitive).
  * Allowed Mime-types: Strictly `image/jpeg` or `image/png`.
  * Maximum size: `5MB` to prevent Denials of Service.
  * Auto-generates unique, randomized, timestamp-salted filenames (`avatar-1718000000000-123456789.png`) to avoid path-traversal exploits or namespace collisions.

#### Request Example (JavaScript Fetch):
```javascript
const formData = new FormData();
formData.append('avatar', imageFile);

const response = await fetch('/api/upload-avatar', {
  method: 'POST',
  body: formData
});
const data = await response.json();
console.log(data);
// Output: { success: true, url: "/uploads/avatar-1718000000000-123456789.png" }
```

---

## 7. Security Best Practices Implemented
1. **Server-Side Upload Filters**: File-type verification checks both the user-declared filename extension AND the actual mime-type header, fully preventing arbitrary script or shell injection.
2. **Path Injection Guard**: Multer writes exclusively to a segregated `uploads/` directory, preventing uploads from mutating execution files.
3. **Lazy SDK Integrations**: Relies on robust local fallback mechanics. Any external SDK calls are lazily initialized only when requested to avoid startup crashes if secrets are missing.
4. **Clean Secret Scoping**: All API endpoints proxy sensitive keys server-side. No API keys are prefixed with `VITE_` or exposed to public client inspection.

---

## 8. Gaps & Opportunities for Future Releases (Roadmap)
While the current architecture is extremely responsive, reliable, and secure, the following improvements can be implemented:

1. **Durable Cloud Persistence (Firebase Firestore)**:
   * *Opportunity*: Transition from LocalStorage to Firestore. This secures multi-device synchronization and guarantees that clearing browser caches will not reset the user's hunter history.
   * *Implementation*: Can be fully provisioned using the `set_up_firebase` tool with secure Firestore rules.
2. **Real-Time Multiplayer Party Dungeons (WebSockets)**:
   * *Opportunity*: Create collaborative daily focus rooms or raid boss events where party members defeat daily logs together.
   * *Implementation*: Express-ws or socket.io listeners running on Port 3000.
3. **Automated Health Integration (OAuth + Google Fit)**:
   * *Opportunity*: Automatically fetch physical step counts, calorie burn, and sleeping metrics without manual task entry.
   * *Implementation*: OAuth client setup using the `set_up_oauth` tool with Google Fit scopes.
