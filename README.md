# 🏯 Bingeki V2

![Build & Deploy](https://github.com/Moussandou/Bingeki-V2/actions/workflows/deploy.yml/badge.svg)

**Bingeki** est une application web PWA de suivi de mangas et d'animes, transformant votre consommation de médias en une véritable aventure RPG inspirée de Hunter x Hunter.

## ✨ Fonctionnalités

### 🎮 Gamification
- **Barre d'XP & Niveaux** : Gagnez de l'expérience à chaque chapitre lu ou épisode vu
- **Streaks** : Maintenez votre flamme active en revenant chaque jour
- **Badges** : Débloquez des succès uniques (Collectionneur, Binge Watcher, etc.)
- **Carte de Chasseur** : Profil personnalisable style licence Hunter x Hunter
- **Graphe Nen** : Visualisation radar de vos statistiques

### 📚 Bibliothèque
- **Mur de Couvertures** : Interface visuelle pour parcourir votre collection
- **Recherche API** : Intégration Jikan (MyAnimeList) pour trouver n'importe quelle œuvre
- **Mode Manuel** : Ajoutez des œuvres rares via un formulaire complet
- **Statuts** : En cours, Terminé, Planifié, En pause, Abandonné
- **Notes & Évaluations** : Notez vos œuvres sur 5 étoiles avec commentaires

### 🔍 Découverte
- **Top Animes/Mangas** : Classements en temps réel depuis Jikan
- **Saison en cours** : Animes de la saison actuelle
- **Recommandations d'amis** : Découvrez ce que vos amis lisent/regardent

### 🤝 Social
- **Système d'amis** : Recherche par email ou nom, demandes d'amitié
- **Activité des amis** : Fil d'actualité des actions de vos amis
- **Défis** : Challenges entre amis avec système d'invitation
  - Course à la fin
  - Plus de chapitres
  - Battle de Streak
- **Watch Parties** : Regardez/lisez ensemble avec synchronisation de progression
- **Œuvres en commun** : Voyez les mangas/animes partagés sur les profils
- **Classement** : Leaderboard par XP, chapitres ou streak

### 👤 Profil
- **Carte Hunter personnalisable** : Couleurs, bannière, bio
- **Manga favori** : Mettez en avant votre œuvre préférée
- **Top 3 favoris** : Sélectionnez vos 3 œuvres favorites
- **Badge vedette** : Affichez votre badge le plus prestigieux
- **Statistiques** : XP, niveau, streak, œuvres, chapitres lus

### ⚙️ Paramètres
- **Thème** : Mode clair/sombre avec couleur d'accent personnalisable
- **Export/Import** : Sauvegardez vos données en JSON
- **Synchronisation** : Mise à jour des métadonnées depuis l'API
- **Réinitialisation** : Reset complet local + cloud

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| TypeScript | Typage statique |
| Vite | Build tool |
| Firebase | Auth, Firestore, Hosting |
| Zustand | State management |
| Framer Motion | Animations |
| Recharts | Graphiques (Nen Chart) |
| Lucide React | Icônes |
| PWA | Installation mobile |

## 🚀 Installation

### Prérequis
- Node.js v18+
- Compte Firebase

### Démarrage

```bash
# Cloner
git clone https://github.com/Moussandou/Bingeki-V2.git
cd Bingeki-V2

# Installer
npm install

# Configurer l'environnement
cp .env.example .env
# Remplir les clés Firebase dans .env

# Lancer
npm run dev
```

## 📦 Déploiement

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

### GitHub Actions
Le projet inclut un workflow CI/CD (`.github/workflows/deploy.yml`) pour déploiement automatique sur push.

## 🔐 Configuration Firestore

### Index requis
Certaines fonctionnalités nécessitent des index composites :
- **Watch Parties** : `watchparties` (hostId ASC, lastActivity DESC)
- **Activités** : `activities` (userId ASC, timestamp DESC)

Les liens de création apparaissent dans la console si manquants.

### Règles de sécurité
```javascript
// Permettre la lecture des bibliothèques entre amis
match /data/{document=**} {
  allow read: if isAuthenticated();
  allow write: if isOwner(userId);
}
```

## 📁 Architecture

```
src/
├── components/       # Composants React
│   ├── ui/           # Composants de base (Button, Card, Modal...)
│   ├── layout/       # Header, Footer, Layout
│   └── profile/      # NenChart
├── pages/            # Pages principales
│   ├── Dashboard     # Accueil avec stats
│   ├── Library       # Gestion de bibliothèque
│   ├── Discover      # Exploration et recherche
│   ├── Social        # Amis, défis, watch parties
│   ├── Profile       # Profil utilisateur
│   ├── WorkDetails   # Détails d'une œuvre
│   └── Settings      # Paramètres
├── store/            # Zustand stores
├── firebase/         # Config et fonctions Firestore
├── services/         # API externes (Jikan)
├── types/            # Types TypeScript
└── styles/           # CSS modules et global
```

## 📱 PWA

L'application est installable sur mobile avec :
- Service Worker pour le cache
- Manifest pour l'installation
- Mode hors-ligne partiel

---

Développé avec ❤️ par [Moussandou](https://github.com/Moussandou)
