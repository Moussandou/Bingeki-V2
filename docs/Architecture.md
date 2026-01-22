# Architecture & Tech Stack 🏗️

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Component-based UI library. |
| **Language** | TypeScript | Type safety and developer experience. |
| **Build Tool** | Vite | Extremely fast dev server and bundler. |
| **Styling** | CSS Modules | Scoped component styling with Vanilla CSS variables. |
| **State** | Zustand | Lightweight global state management. |
| **Backend** | Firebase | Auth, Firestore (NoSQL DB), Storage, Hosting. |
| **Icons** | Lucide React | Consistent, lightweight vector icons. |
| **Charts** | Recharts | Visualization for the "Nen Chart". |
| **Animations** | Framer Motion | Fluid layouts and gesture-based animations. |

## Project Structure

```
src/
├── components/          # React Components
│   ├── ui/              # Atom-level UI (Button, Card, Modal)
│   ├── layout/          # Layout blocks (Header, Footer, SEO)
│   ├── library/         # Library-specific components
│   ├── profile/         # Profile & Stats components
│   └── pwa/             # PWA Install logic
├── pages/               # Route Pages
│   ├── Dashboard/       # Home/Summary view
│   ├── Library/         # Main collection view
│   ├── WorkDetails/     # Specific Anime/Manga details
│   └── Social/          # Friends & Challenges
├── store/               # Zustand Stores
│   ├── authStore.ts     # User session & profile data
│   ├── libraryStore.ts  # CRUD for user's collection
│   └── settingsStore.ts # Theme & Preference config
├── firebase/            # Firebase Config & Helpers
├── services/            # External APIs (Jikan/MyAnimeList)
├── styles/              # Global variables & resets
└── i18n.ts              # Internationalization config
```

## Data Schema (Firestore)

### `users/{userId}`
Stores user profile and gamification stats.
- `displayName`, `photoURL`
- `level`, `xp`, `streak`
- `badges`: Array of unlocked badge IDs.
- `nenStats`: { passion, diligence, ... }

### `users/{userId}/works/{workId}`
Sub-collection for the user's library.
- `id`: Jikan ID
- `title`, `image`
- `type`: 'anime' | 'manga'
- `status`: 'completed' | 'watching' | 'plan_to_watch'
- `progress`: Number (chapters read / episodes watched)
- `rating`: 0-5

### `users/{userId}/activities/{activityId}`
Log of user actions for the social feed.
- `type`: 'read', 'watch', 'level_up'
- `targetName`: "One Piece", etc.
- `timestamp`

### `watchparties/{partyId}`
Shared state for synchronous viewing sessions.
