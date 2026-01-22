# Feature: Gamification 🎮

Bingeki's core differentiator is its RPG layer. Users don't just "consume" content; they "level up".

## Core Mechanics

### Experience (XP)
XP is awarded for meaningful actions on the platform.

| Action | XP Awarded | Cap |
| :--- | :--- | :--- |
| **Read Chapter** | +50 XP | - |
| **Watch Episode** | +100 XP | - |
| **Add Work** | +20 XP | Max 5/day |
| **Complete Work** | +500 XP | - |
| **Daily Login** | +100 XP | Once/day |

### Levels & Ranks
XP contributes to the user's Level.
- **Formula**: `Level = floor(sqrt(XP / 100))`
- **Ranks**: Based on level milestones (F, E, D, C, B, A, S, SS, SSS).

### Nen Chart (Radar Chart)
A visual representation of a user's "hunter type", calculated dynamically from their stats.

- **Passion**: Based on Total XP.
- **Diligence**: Based on Login Streak.
- **Collection**: Number of works in library.
- **Reading**: Total chapters read.
- **Completion**: Number of completed works.

*Technically implemented using `Recharts` in `src/components/profile/CategoricalChart.tsx`.*

### Badges
Unlockable achievements displayed on the profile.
- **Logic**: Evaluated on every relevant action (e.g., checking if `chapters_read > 1000`).
- **Storage**: Use IDs stored in `users/{userId}/badges`.
