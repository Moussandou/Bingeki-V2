# Feature: Social 🤝

Bingeki V2 introduces social features to turn solitary reading into a shared experience.

## Friends System
- **Search**: Users can search for others by exact DataBase property (email or username).
- **Requests**: Send/Accept/Decline flow stored in `users/{userId}/friendRequests`.
- **Friend List**: Reference array of user IDs.

## Activity Feed
A unified feed showing actions from all friends.
- **Implementation**: Listens to the `activities` collection where `userId` is in the current user's friend list.
- **Events**: "User X started reading One Piece", "User Y reached Level 10".

## Watch Parties
Real-time synchronized viewing/reading sessions.
- **State**: A Firestore document `watchparties/{partyId}` holds the current state (Work ID, Chapter/Episode number, IsPaused).
- **Sync**: All participants subscribe to this document. When the host updates the episode, everyone's UI updates instantly.

## Challenges (WIP)
Competitive goals between friends.
- *Examples*: "Read 50 chapters this week", "Finish 'Bleach' before your friend".
