# 🏯 Bingeki V2

![Build & Deploy](https://github.com/Moussandou/Bingeki-V2/actions/workflows/deploy.yml/badge.svg)

**Bingeki** est une application web immersive de suivi de mangas et d'animes, transformant votre consommation de médias en une véritable aventure RPG.

![Bingeki Preview](https://via.placeholder.com/800x400?text=Bingeki+Preview)

## ✨ Fonctionnalités

### 🎮 Expérience Ludifiée (Gamification)
- **Barre d'XP & Niveaux** : Gagnez de l'expérience à chaque chapitre lu ou épisode vu.
- **Séries (Streaks)** : Maintenez votre flamme active en revenant chaque jour.
- **Badges** : Débloquez des succès uniques (Collectionneur, Binge Watcher, etc.).

### 📚 Bibliothèque Interactive
- **Mur de Mangas** : Une interface 3D immersive pour parcourir votre collection.
- **Recherche API** : Intégration de Jikan (MyAnimeList) pour trouver n'importe quelle œuvre.
- **Mode Manuel** : Ajoutez des œuvres rares ou personnelles via un formulaire complet.

### ⚔️ Suivi de Progression
- **Timeline Narrative** : Ne suivez pas juste des chapitres, visualisez votre avancée à travers les arcs narratifs.
- **Bouton d'Action** : Mise à jour rapide avec des animations d'impact satisfaisantes.

### 🎨 Design System & Tech
- **Stack Moderne** : React 18, Vite, TypeScript, Firebase.
- **Animations** : Framer Motion pour des transitions fluides et cinématiques.
- **Thèmes** : Support complet du mode sombre et personnalisation (Settings).

## 🚀 Installation & Démarrage

### Prérequis
- Node.js (v18+)
- Compte Firebase

### Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Moussandou/Bingeki-V2.git
   cd Bingeki-V2
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env` à la racine (voir `.env.example`) avec vos clés Firebase :
   ```env
   VITE_FIREBASE_API_KEY=votre_api_key
   VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
   ...
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

## 📦 Déploiement

Le projet est configuré pour **Firebase Hosting**.

1. Installer les outils Firebase (si nécessaire) :
   ```bash
   npm install -g firebase-tools
   ```

2. Login et Déploiement :
   ```bash
   firebase login
   firebase deploy
   ```

## 🏗️ Architecture

Le projet suit une architecture modulaire :

- `src/components/ui` : Composants de base (Button, Card, Switch).
- `src/pages` : Pages principales (Lazy loaded).
- `src/store` : Gestion d'état avec Zustand (Auth, Settings, Gamification).
- `src/styles` : Tokens CSS et animations globales.
- `src/services` : Intégrations API externes.

## 🛡️ Règles de Sécurité

Les règles Firestore (`firestore.rules`) assurent que :
- Chaque utilisateur ne peut lire/écrire que ses propres données.
- Les badges sont en lecture seule (gérés par l'admin).

---

Développé avec ❤️ pour les fans de Manga.
