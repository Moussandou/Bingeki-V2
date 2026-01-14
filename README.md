# 🏯 Bingeki V2

![Build & Deploy](https://github.com/Moussandou/Bingeki-V2/actions/workflows/deploy.yml/badge.svg)
![CI Status](https://github.com/Moussandou/Bingeki-V2/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/Moussandou/Bingeki-V2)
![Version](https://img.shields.io/badge/version-2.6-blue)
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H41S9PFY)

**Bingeki** est une application web PWA de suivi de mangas et d'animes, transformant votre consommation de médias en une véritable aventure RPG.

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
- **Défis** : Challenges entre amis avec système d'invitation (Course, Streak, Chapitres)
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

## 📸 Galerie

> *Captures d'écran à venir...*

<!--
Ajoutez vos screenshots ici :
![Dashboard](./screenshots/dashboard.png)
![Hunter Card](./screenshots/card.png)
-->

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI |
| **TypeScript** | Typage statique |
| **Vite** | Build tool ultra-rapide |
| **Firebase** | Auth, Firestore, Hosting, Storage |
| **Zustand** | State management léger |
| **Framer Motion** | Animations fluides |
| **Recharts** | Graphiques (Nen Chart) |
| **Lucide React** | Icônes vectorielles |
| **PWA** | Installation mobile & Offline support |

## 🚀 Installation

### Prérequis
- Node.js v18+
- Compte Firebase

### Démarrage

```bash
# Cloner le projet
git clone https://github.com/Moussandou/Bingeki-V2.git
cd Bingeki-V2

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Remplir les clés Firebase dans .env

# Lancer le serveur de développement
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

### CI/CD (GitHub Actions)
- **Deploy** : Déploiement automatique sur `firebase` lors d'un push sur `main`.
- **Validation** : Linting et Type Checking automatique sur les Pull Requests et autres branches.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour proposer des changements :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

Assurez-vous que les tests passent et que le code respecte les standards (Linting).

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 🔐 Configuration Firestore

### Index requis
Certaines fonctionnalités nécessitent des index composites :
- **Watch Parties** : `watchparties` (hostId ASC, lastActivity DESC)
- **Activités** : `activities` (userId ASC, timestamp DESC)

Les liens de création apparaissent dans la console Firebase si manquants.

### Règles de sécurité (Extrait)
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
