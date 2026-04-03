# Gamification System Rules

Bingeki uses a robust gamification engine to encourage user engagement and reward progress. This document defines the XP math, leveling progression, and badge mechanics.

## XP & Leveling Logic

The leveling system uses a geometric progression to ensure that reaching higher levels becomes progressively more challenging.

### 1. The Leveling Formula
*   **Base XP (Level 1 → 2)**: 100 XP
*   **Growth Multiplier**: 1.15x per level
*   **Max Level**: 100

**XP Required for Next Level (n+1)**:  
`floor(current_xp_required * 1.15)`

| Level | XP to Next | Cumulative XP |
| :--- | :--- | :--- |
| 1 | 100 | 0 |
| 2 | 115 | 100 |
| 3 | 132 | 215 |
| 5 | 174 | 450 |
| 10 | 350 | 1,500 approx. |

---

## XP Rewards Table

| Action | XP Amount | Notes |
| :--- | :--- | :--- |
| **Add Work** | 15 XP | One-time bonus when adding to library. |
| **Update Progress** | 10 XP | Granted per chapter/episode. |
| **Complete Work** | 50 XP | Bonus when status changes to 'Completed'. |
| **Daily Login** | 25 XP | Granted once every 24 hours. |
| **Streak Bonus** | +5 XP / day | Max +100 XP bonus per login. |

### Anti-Cheat & Validation
To maintain a fair leaderboard, the following rules apply:
*   **Known Totals Only**: Progress XP is **only** awarded if the work has a known total number of chapters/episodes from the official API. This prevents manual "infinite progress" inflation.
*   **Deterministic Recalculation**: The system periodically recalculates the user's total XP from their entire library to ensure the local state matches the true work history.
*   **Server-Side Hard Caps**: Cloud Functions enforce daily XP limits to prevent scripted "XP farming".

---

## Streak Mechanics

The streak system rewards consistency but is forgiving to occasional life events.
*   **Continuity Check**: A streak is maintained if the user logs in within **48 hours** of their last activity.
*   **Reset**: If more than 48 hours pass, the streak resets to 1.
*   **Scaling Bonus**: Each consecutive day adds +5 XP to the daily login reward, capping at +100 XP (Day 21+).

---

## Badges & Trophies

Badges are special milestones tracked across multiple categories.

### Category: Collector
*   **Newcomer**: Add 1 work.
*   **Otaku**: Add 25 works.
*   **Librarian**: Add 100 works.

### Category: Completionist
*   **First Steps**: Finish 1 work.
*   **Binge Watcher**: Finish 10 Anime.
*   **Legendary Hunter**: Finish 100 works.

### Category: Social
*   **Social Butterfly**: Have 5 friends.
*   **Community Icon**: Receive 50 likes on your profile.

> [!TIP]
> Badges are awarded automatically by a Firestore trigger (`onLibraryUpdate`). If you fulfill a requirement offline, the badge will appear as soon as your device syncs with the cloud.
