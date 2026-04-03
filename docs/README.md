# Bingeki Architecture & Documentation

Welcome to the internal documentation for Bingeki V2. This folder contains detailed architectural guides for developers and contributors.

## Table of Contents

### 1. [Firebase Backend](file:///Users/moussandou/Code/Bingeki-V2/docs/Firebase-Backend.md)
*   Firestore structure (Collections/Subcollections).
*   Security rules logic and field protections.
*   Cloud Functions (Triggers, SEO Handler, OG Images).

### 2. [Synchronization & Offline Design](file:///Users/moussandou/Code/Bingeki-V2/docs/Sync-Design.md)
*   Offline-first strategy (Zustand + LocalStorage).
*   Firestore sync lifecycle and debouncing.
*   Conflict resolution (Last-Update-Wins).

### 3. [Gamification System Rules](file:///Users/moussandou/Code/Bingeki-V2/docs/Gamification-Rules.md)
*   XP Reward table and leveling math.
*   Daily streaks and bonus hunters.
*   Anti-cheat mechanisms and server-side validation.

### 4. [Social & Community Features](file:///Users/moussandou/Code/Bingeki-V2/docs/Social-Features.md)
*   Global Activity feed mechanics.
*   Mutual friendship system.
*   Dynamic "Hunter License" sharing.

---

## Contributing
If you are adding a new feature, please update the relevant documentation file or create a new one to maintain technical clarity across the team.
