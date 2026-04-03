# Architecture & Tech Stack 🏗️

Bingeki V2 is designed as a high-performance, mobile-first Progressive Web App (PWA). The architecture prioritizes **speed**, **maintainability**, and a **"Brutalist Manga"** aesthetic.

## ⚛️ React Strategy

Bingeki uses **React 18** to leverage modern concurrent features while maintaining a lightweight footprint.

### Why React?
1.  **Component-Based Architecture**: Allows for reusable UI "Atoms" (Buttons, Inputs) and "Molecules" (ActionCards, Modals).
2.  **Ecosystem**: Native integration with **Framer Motion** for layout transitions and **React Router 7** for nested routing.
3.  **PWA Compatibility**: React's lifecycle methods and hooks (like `useEffect` and `useSyncExternalStore`) make it ideal for handling offline states and background sync.

### Pattern: Functional Components & Hooks
We exclusively use Functional Components with specialized custom hooks for side effects.
```tsx
// Example of a data-fetching hook with Jikan API
export function useAnimeSearch(query: string) {
    const [results, setResults] = useState<Anime[]>([]);
    useEffect(() => {
        if (!query) return;
        const fetchAnime = async () => {
            const data = await jikanService.search(query);
            setResults(data);
        };
        fetchAnime();
    }, [query]);
    return results;
}
```

---

## 📦 State Management (Zustand)

We use **Zustand** for global state. It was chosen over Redux for its minimal boilerplate and superior performance with React's concurrent rendering.

### Persistence & Middleware
Most stores use the `persist` middleware to automatically sync state with `localStorage`.
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            works: [],
            addWork: (work) => set((state) => ({
                works: [...state.works, { ...work, dateAdded: Date.now() }]
            })),
            getWork: (id) => get().works.find((w) => w.id === id),
        }),
        { name: 'bingeki-library-storage' }
    )
);
```

### Selector Pattern
To prevent unnecessary re-renders, always use selectors when consuming state:
```tsx
// ❌ Bad: Re-renders on any store change
const { works } = useLibraryStore();

// ✅ Good: Only re-renders if works array changes
const works = useLibraryStore(state => state.works);
```

---

## 🎨 Styling Architecture

Bingeki uses **Vanilla CSS** with **CSS Modules** and a **Global Token System**. This approach ensures maximum performance (zero-runtime CSS-in-JS) and prevents class name collisions.

### 1. Global Tokens (`tokens.css`)
We define all constants (colors, spacing, durations) as CSS Variables.
```css
:root {
  --color-primary: #FF2E63;
  --space-md: 1rem;
  --duration-fast: 0.2s;
}
```

### 2. CSS Modules
Each component has its own `.module.css` file.
```tsx
import styles from './Button.module.css';

export function Button({ children, variant = 'primary' }) {
    return (
        <button className={cn(styles.button, styles[variant])}>
            {children}
        </button>
    );
}
```

### 3. "Brutalist Manga" Implementation
The manga aesthetic is achieved via thick borders, solid shadows, and high-energy hover states defined in `manga-theme.css`.
```css
.manga-panel {
    border: 4px solid var(--color-border-heavy);
    box-shadow: 6px 6px 0px var(--color-shadow-solid);
    transition: transform var(--duration-fast) var(--ease-expo);
}
```

---

## 📁 Project Structure (Atomic Design Lite)

-   `src/components/ui/`: **Atoms** - Basic building blocks (Button, Input, Badge). No business logic.
-   `src/components/library/`: **Molecules/Organisms** - Domain-specific components (WorkCard, CollectionGrid).
-   `src/pages/`: **Templates/Pages** - Full page layouts and route entry points.
-   `src/store/`: **Global State** - Business logic and data persistence.
-   `src/services/`: **External APIs** - Pure functions for API calls (Jikan, Firestore).

## 🤖 SEO & Performance Highlights

1.  **Hybrid Rendering**: Core shell is CSR (Client-Side Rendering) for speed, while `scripts/prerender.ts` generates static snapshots for SEO.
2.  **Edge Interception**: Firebase Cloud Functions (`seoHandler`) inject dynamic OG tags for social sharing.
3.  **Image Proxying**: Uses `wsrv.nl` for real-time resizing and WebP conversion to maintain a near-perfect Lighthouse score.
