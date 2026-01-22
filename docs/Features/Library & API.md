# Feature: Library & API 📚

The heart of the application: managing your collection of Manga and Anime.

## Jikan API Integration
We use [Jikan](https://jikan.moe/), an unofficial MyAnimeList API, for all data.
- **Search**: `GET /anime?q=...`
- **Details**: `GET /anime/{id}/full`
- **Rate Limit**: Jikan has strict rate limits. We implement a local caching layer and a queue system (`src/utils/apiQueue.ts`) to handle 429 errors gracefully.

## Offline Mode
The library is fully accessible offline thanks to:
1.  **PWA Caching**: Assets and JS bundles are cached by the Service Worker.
2.  **Firestore Persistence**: `enableIndexedDbPersistence()` is called in `firebase/config.ts`. This caches the user's library and profile locally, syncing changes when connection is restored.

## Library Management
- **Status**: users can categorize works (Watching, Completed, Plan to Watch, etc.).
- **Progress**: Tracking exact chapter/episode counts.
- **Manual Entry**: For rare works not on MAL, users can manually create entries via the "Recruit Work" modal (Manual Tab).
