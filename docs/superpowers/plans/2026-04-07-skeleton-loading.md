# Skeleton Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les spinners et écrans vides par des skeletons pixel-perfect sur toutes les pages, via boneyard-js et son CLI de scan headless.

**Architecture:** Chaque page wrappe son contenu dans `<Skeleton name="..." loading={...}>` de boneyard-js. Le CLI scanne les pages via Playwright, génère des `.bones.json` dans `src/bones/`, et un `registry.js` auto-généré est importé une seule fois dans `src/main.tsx`. Les couleurs utilisent `var(--color-border)` pour s'adapter au thème light/dark du projet.

**Tech Stack:** boneyard-js, React, TypeScript, Firebase Auth (compte test dédié pour le scan)

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `package.json` | Ajouter `boneyard-js` |
| `src/main.tsx` | Ajouter `import './bones/registry'` |
| `.gitignore` | Ajouter `boneyard.config.json` |
| `boneyard.config.json` | Créer (non commité) — credentials Firebase scanner |
| `src/bones/registry.js` | Auto-généré par CLI |
| `src/bones/*.bones.json` | Auto-généré par CLI (un par page) |
| `src/pages/Dashboard.tsx` | Wrapper `<Skeleton>` |
| `src/pages/Library.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/WorkDetails.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Profile.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Discover.tsx` | Wrapper `<Skeleton>` |
| `src/pages/Schedule.tsx` | Wrapper `<Skeleton>` + `isLoading` initial |
| `src/pages/Opening.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Lens.tsx` | Wrapper `<Skeleton>` + `isLoading` initial |
| `src/pages/Social.tsx` | Wrapper `<Skeleton>` + `isLoading` initial |
| `src/pages/CharacterDetails.tsx` | Wrapper `<Skeleton>` |
| `src/pages/PersonDetails.tsx` | Wrapper `<Skeleton>` |
| `src/pages/tierlist/TierListFeed.tsx` | Wrapper `<Skeleton>` |
| `src/pages/tierlist/CreateTierList.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/tierlist/ViewTierList.tsx` | Wrapper `<Skeleton>` |
| `src/pages/NewsIndex.tsx` | Wrapper `<Skeleton>` |
| `src/pages/NewsArticle.tsx` | Wrapper `<Skeleton>` |
| `src/pages/Changelog.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Challenges.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Auth.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Settings.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Notifications.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Feedback.tsx` | Wrapper `<Skeleton>` |
| `src/pages/FormSurvey.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Contact.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/About.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Privacy.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Terms.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Legal.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Credits.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/Donors.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/admin/Dashboard.tsx` | Wrapper `<Skeleton>` |
| `src/pages/admin/Users.tsx` | Wrapper `<Skeleton>` |
| `src/pages/admin/Health.tsx` | Wrapper `<Skeleton>` |
| `src/pages/admin/FeedbackList.tsx` | Wrapper `<Skeleton>` |
| `src/pages/admin/FeedbackAdmin.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/admin/analytics/Engagement.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/admin/analytics/Growth.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/admin/analytics/Retention.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/admin/SurveyDashboard.tsx` | Wrapper `<Skeleton>` + `isLoading` state |
| `src/pages/AssetsPage.tsx` | Wrapper `<Skeleton>` + `isLoading` state |

---

## Task 1: Installer boneyard-js et setup de base

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx`
- Modify: `.gitignore`
- Create: `boneyard.config.json` (non commité)
- Create: `src/bones/.gitkeep`

- [ ] **Step 1: Installer boneyard-js**

```bash
npm install boneyard-js
```

Expected: boneyard-js apparaît dans `package.json` sous `dependencies`.

- [ ] **Step 2: Créer le dossier src/bones avec un .gitkeep**

```bash
mkdir -p src/bones && touch src/bones/.gitkeep
```

- [ ] **Step 3: Ajouter l'import du registry dans src/main.tsx**

Dans `src/main.tsx`, ajouter après les imports existants (ligne 8, après `import { ErrorBoundary } ...`) :

```tsx
// Boneyard skeleton registry — populated after running: npx boneyard-js build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import './bones/registry'
```

Note: Le `ts-ignore` est nécessaire car `registry.js` est auto-généré et n'a pas de types. Il n'existera pas au premier lancement — le `ts-ignore` évite l'erreur de compilation avant le premier scan.

- [ ] **Step 4: Ajouter boneyard.config.json au .gitignore**

Ajouter à la fin de `.gitignore` :

```
boneyard.config.json
src/bones/registry.js
```

Note: `registry.js` est aussi exclu car il contient des chemins absolus qui varient par machine. Les `.bones.json` eux sont commités.

- [ ] **Step 5: Créer boneyard.config.json (ne pas commiter)**

Créer `boneyard.config.json` à la racine :

```json
{
  "auth": {
    "cookies": [
      {
        "name": "firebaseToken",
        "value": "REMPLACER_PAR_TOKEN_DU_COMPTE_TEST"
      }
    ]
  }
}
```

Pour obtenir le token : se connecter dans l'app avec le compte test `skeleton-scanner@bingeki.app`, ouvrir les DevTools > Application > Cookies, copier la valeur du cookie d'auth Firebase.

- [ ] **Step 6: Vérifier que le projet compile**

```bash
npm run build
```

Expected: build réussi sans erreur (le `ts-ignore` sur le registry supprime l'erreur de module manquant).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/main.tsx .gitignore src/bones/.gitkeep
git commit -m "feat: install boneyard-js and setup skeleton loading infrastructure"
```

---

## Task 2: Wrapper les pages principales (Dashboard, Library, WorkDetails, Profile)

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/Library.tsx`
- Modify: `src/pages/WorkDetails.tsx`
- Modify: `src/pages/Profile.tsx`

### Dashboard

- [ ] **Step 1: Ajouter le wrapper Skeleton dans Dashboard**

Dans `src/pages/Dashboard.tsx`, ajouter l'import :

```tsx
import { Skeleton } from 'boneyard-js/react'
```

Puis identifier le retour JSX principal (le `<Layout>...</Layout>`). Wrapper le **contenu intérieur** du Layout (pas le Layout lui-même) avec Skeleton. Dashboard a déjà `isLoadingActivity` — l'utiliser comme flag principal :

```tsx
// Avant (dans le JSX, à l'intérieur de <Layout>):
<div className={styles.dashboard}>
  {/* ... tout le contenu ... */}
</div>

// Après :
<Skeleton
  name="dashboard"
  loading={isLoadingActivity}
  color="var(--color-border)"
  darkColor="var(--color-border)"
>
  <div className={styles.dashboard}>
    {/* ... tout le contenu ... */}
  </div>
</Skeleton>
```

### Library

- [ ] **Step 2: Ajouter isLoading et wrapper Skeleton dans Library**

Library a `isLoadingFriend` mais pas de flag global. Ajouter un `isLoading` local qui se résout dès que les données du store Zustand sont accessibles :

```tsx
// Dans src/pages/Library.tsx, dans le composant, après les autres useState :
const [isLoading, setIsLoading] = useState(true)

// Dans le useEffect qui charge les données (ou en ajouter un si absent) :
useEffect(() => {
  setIsLoading(false)
}, [localWorks])
```

Puis ajouter l'import et le wrapper comme pour Dashboard, avec `name="library"`.

### WorkDetails

- [ ] **Step 3: Ajouter isLoading et wrapper Skeleton dans WorkDetails**

WorkDetails a des états de chargement granulaires (`isLoadingEpisodes`, `isLoadingComments`) mais pas de flag de chargement initial global. Ajouter :

```tsx
// Après les imports existants dans WorkDetails.tsx :
import { Skeleton } from 'boneyard-js/react'

// Dans le composant, avec les autres useState :
const [isPageLoading, setIsPageLoading] = useState(true)

// Dans le premier useEffect de chargement des données de l'œuvre :
// (le useEffect qui fait l'appel API pour les infos de base de l'œuvre)
// Ajouter à la fin du useEffect, une fois les données chargées :
setIsPageLoading(false)
```

Wrapper avec `name="work-details"`.

### Profile

- [ ] **Step 4: Ajouter isLoading et wrapper Skeleton dans Profile**

Profile a `friendshipStatus` qui commence à `'loading'` — utiliser cet état :

```tsx
import { Skeleton } from 'boneyard-js/react'

// Dans le JSX, wrapper le contenu principal avec :
<Skeleton
  name="profile"
  loading={friendshipStatus === 'loading'}
  color="var(--color-border)"
  darkColor="var(--color-border)"
>
  {/* contenu existant */}
</Skeleton>
```

- [ ] **Step 5: Vérifier que le projet compile**

```bash
npm run dev
```

Naviguer vers `/dashboard`, `/library`, `/work/1`, `/profile` et vérifier que les pages s'affichent correctement (pas de régression visuelle).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/Library.tsx src/pages/WorkDetails.tsx src/pages/Profile.tsx
git commit -m "feat: add skeleton wrappers to main pages (Dashboard, Library, WorkDetails, Profile)"
```

---

## Task 3: Wrapper les pages Découverte et Social

**Files:**
- Modify: `src/pages/Discover.tsx`
- Modify: `src/pages/Schedule.tsx`
- Modify: `src/pages/Opening.tsx`
- Modify: `src/pages/Lens.tsx`
- Modify: `src/pages/Social.tsx`
- Modify: `src/pages/CharacterDetails.tsx`
- Modify: `src/pages/PersonDetails.tsx`

- [ ] **Step 1: Wrapper Discover**

Discover a `isLoadingSections` (démarre à `true`). Ajouter l'import et wrapper avec `name="discover"`, `loading={isLoadingSections}`.

- [ ] **Step 2: Wrapper Schedule**

Schedule a `loading` (démarre à `false`). Ajouter un état initial `true` :

```tsx
import { Skeleton } from 'boneyard-js/react'

// Changer la déclaration :
const [loading, setLoading] = useState(true)  // était false
```

Wrapper avec `name="schedule"`, `loading={loading}`.

- [ ] **Step 3: Wrapper Opening**

Inspecter `src/pages/Opening.tsx` pour identifier l'état de chargement existant. Si absent, ajouter :

```tsx
import { useState, useEffect } from 'react'
import { Skeleton } from 'boneyard-js/react'

const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  setIsLoading(false)
}, [])
```

Wrapper avec `name="opening"`, `loading={isLoading}`.

- [ ] **Step 4: Wrapper Lens**

Lens a `loading` (démarre à `false`). Même pattern que Schedule — changer à `true` initial et wrapper avec `name="lens"`.

- [ ] **Step 5: Wrapper Social**

Social a `loading` (démarre à `false`). Changer à `true` initial et wrapper avec `name="social"`.

- [ ] **Step 6: Wrapper CharacterDetails et PersonDetails**

Les deux ont `loading` démarrant à `true`. Ajouter import et wrapper :
- CharacterDetails : `name="character-details"`, `loading={loading}`
- PersonDetails : `name="person-details"`, `loading={loading}`

- [ ] **Step 7: Vérifier**

```bash
npm run dev
```

Naviguer vers `/discover`, `/schedule`, `/social`, `/character/1`, `/person/1` — pas de régression.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Discover.tsx src/pages/Schedule.tsx src/pages/Opening.tsx src/pages/Lens.tsx src/pages/Social.tsx src/pages/CharacterDetails.tsx src/pages/PersonDetails.tsx
git commit -m "feat: add skeleton wrappers to Discovery and Social pages"
```

---

## Task 4: Wrapper les pages Tier Lists et Contenu

**Files:**
- Modify: `src/pages/tierlist/TierListFeed.tsx`
- Modify: `src/pages/tierlist/CreateTierList.tsx`
- Modify: `src/pages/tierlist/ViewTierList.tsx`
- Modify: `src/pages/NewsIndex.tsx`
- Modify: `src/pages/NewsArticle.tsx`
- Modify: `src/pages/Changelog.tsx`
- Modify: `src/pages/Challenges.tsx`

- [ ] **Step 1: Wrapper TierListFeed**

A `loading` démarrant à `true`. Ajouter import et wrapper avec `name="tier-list-feed"`, `loading={loading}`.

- [ ] **Step 2: Wrapper ViewTierList**

A `loading` démarrant à `true`. Wrapper avec `name="view-tier-list"`, `loading={loading}`.

- [ ] **Step 3: Wrapper CreateTierList**

Inspecter `src/pages/tierlist/CreateTierList.tsx`. Si pas de flag de chargement, ajouter :

```tsx
import { useState, useEffect } from 'react'
import { Skeleton } from 'boneyard-js/react'

const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  setIsLoading(false)
}, [])
```

Wrapper avec `name="create-tier-list"`.

- [ ] **Step 4: Wrapper NewsIndex et NewsArticle**

Les deux ont `loading` démarrant à `true`. Wrapper :
- NewsIndex : `name="news-index"`, `loading={loading}`
- NewsArticle : `name="news-article"`, `loading={loading}`

- [ ] **Step 5: Wrapper Changelog et Challenges**

Les deux n'ont probablement pas de flag de chargement (contenu statique ou Firebase one-shot). Ajouter le pattern `useState(true)` + `useEffect(() => setIsLoading(false), [])` à chacun. Wrapper :
- Changelog : `name="changelog"`
- Challenges : `name="challenges"`

- [ ] **Step 6: Vérifier**

```bash
npm run dev
```

Naviguer vers `/tier-lists`, `/news`, `/changelog`, `/challenges`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/tierlist/ src/pages/NewsIndex.tsx src/pages/NewsArticle.tsx src/pages/Changelog.tsx src/pages/Challenges.tsx
git commit -m "feat: add skeleton wrappers to TierList and Content pages"
```

---

## Task 5: Wrapper les pages Auth, Settings, Formulaires

**Files:**
- Modify: `src/pages/Auth.tsx`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/pages/Notifications.tsx`
- Modify: `src/pages/Feedback.tsx`
- Modify: `src/pages/FormSurvey.tsx`
- Modify: `src/pages/Contact.tsx`

- [ ] **Step 1: Wrapper Auth**

Auth page — ajouter `useState(true)` + `useEffect(() => setIsLoading(false), [])`. Wrapper avec `name="auth"`.

- [ ] **Step 2: Wrapper Settings**

Settings — même pattern. Wrapper avec `name="settings"`.

- [ ] **Step 3: Wrapper Notifications**

Notifications — même pattern. Wrapper avec `name="notifications"`.

- [ ] **Step 4: Wrapper Feedback**

Feedback a `loadingTickets` et `loadingDetail`. Utiliser `loadingTickets` comme flag principal (c'est le premier chargement). Wrapper avec `name="feedback"`, `loading={loadingTickets}`.

- [ ] **Step 5: Wrapper FormSurvey et Contact**

Ajouter `useState(true)` + `useEffect(() => setIsLoading(false), [])` aux deux. Wrappers :
- FormSurvey : `name="form-survey"`
- Contact : `name="contact"`

- [ ] **Step 6: Vérifier**

```bash
npm run dev
```

Naviguer vers `/auth`, `/settings`, `/notifications`, `/feedback`, `/contact`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Auth.tsx src/pages/Settings.tsx src/pages/Notifications.tsx src/pages/Feedback.tsx src/pages/FormSurvey.tsx src/pages/Contact.tsx
git commit -m "feat: add skeleton wrappers to Auth, Settings and Form pages"
```

---

## Task 6: Wrapper les pages statiques et admin

**Files:**
- Modify: `src/pages/About.tsx`
- Modify: `src/pages/Privacy.tsx`
- Modify: `src/pages/Terms.tsx`
- Modify: `src/pages/Legal.tsx`
- Modify: `src/pages/Credits.tsx`
- Modify: `src/pages/Donors.tsx`
- Modify: `src/pages/AssetsPage.tsx`
- Modify: `src/pages/admin/Dashboard.tsx`
- Modify: `src/pages/admin/Users.tsx`
- Modify: `src/pages/admin/Health.tsx`
- Modify: `src/pages/admin/FeedbackList.tsx`
- Modify: `src/pages/admin/FeedbackAdmin.tsx`
- Modify: `src/pages/admin/SurveyDashboard.tsx`
- Modify: `src/pages/admin/analytics/Engagement.tsx`
- Modify: `src/pages/admin/analytics/Growth.tsx`
- Modify: `src/pages/admin/analytics/Retention.tsx`

- [ ] **Step 1: Wrapper les pages statiques**

Pour chacune de ces pages (About, Privacy, Terms, Legal, Credits, Donors, AssetsPage), appliquer le même pattern minimal :

```tsx
import { useState, useEffect } from 'react'
import { Skeleton } from 'boneyard-js/react'

// Dans le composant :
const [isLoading, setIsLoading] = useState(true)
useEffect(() => { setIsLoading(false) }, [])

// Dans le JSX, wrapper le contenu principal :
<Skeleton name="about" loading={isLoading} color="var(--color-border)" darkColor="var(--color-border)">
  {/* contenu existant */}
</Skeleton>
```

Noms : `about`, `privacy`, `terms`, `legal`, `credits`, `donors`, `assets`.

- [ ] **Step 2: Wrapper les pages admin avec loading existant**

Admin Dashboard, Users, Health, FeedbackList ont tous `loading` démarrant à `true`. Ajouter import et wrapper :
- `admin/Dashboard.tsx` : `name="admin-dashboard"`, `loading={loading}`
- `admin/Users.tsx` : `name="admin-users"`, `loading={loading}`
- `admin/Health.tsx` : `name="admin-health"`, `loading={loading}`
- `admin/FeedbackList.tsx` : `name="admin-feedback"`, `loading={loading}`

- [ ] **Step 3: Wrapper les pages admin sans loading existant**

Pour FeedbackAdmin, SurveyDashboard, Engagement, Growth, Retention : inspecter chaque fichier. Si pas de flag de chargement, ajouter `useState(true)` + `useEffect(() => setIsLoading(false), [données_chargées])`. Wrappers : `admin-feedback-admin`, `admin-survey`, `admin-engagement`, `admin-growth`, `admin-retention`.

- [ ] **Step 4: Vérifier**

```bash
npm run dev
```

Naviguer vers `/about`, `/privacy`, `/admin` (avec compte admin).

- [ ] **Step 5: Commit**

```bash
git add src/pages/About.tsx src/pages/Privacy.tsx src/pages/Terms.tsx src/pages/Legal.tsx src/pages/Credits.tsx src/pages/Donors.tsx src/pages/AssetsPage.tsx src/pages/admin/
git commit -m "feat: add skeleton wrappers to static and admin pages"
```

---

## Task 7: Scanner les pages et générer les bones

Cette tâche doit être exécutée **manuellement** car elle nécessite un compte Firebase actif et un dev server en cours.

**Prérequis :**
- `boneyard.config.json` créé avec un token Firebase valide (compte `skeleton-scanner@bingeki.app` avec rôle admin)
- Le compte test a quelques œuvres dans sa bibliothèque (pour que Dashboard et Library aient du contenu)

- [ ] **Step 1: Démarrer le dev server**

```bash
npm run dev
```

Laisser tourner dans un terminal séparé.

- [ ] **Step 2: Scanner toutes les pages publiques**

Dans un second terminal :

```bash
npx boneyard-js build http://localhost:5173 --out src/bones
```

Le CLI crawle toutes les routes et génère les `.bones.json` + `registry.js` dans `src/bones/`.

- [ ] **Step 3: Vérifier les fichiers générés**

```bash
ls src/bones/
```

Expected: un fichier `.bones.json` par page + `registry.js`.

Si des pages manquent (souvent les pages auth-protégées), les scanner individuellement :

```bash
npx boneyard-js build http://localhost:5173/dashboard --out src/bones
npx boneyard-js build http://localhost:5173/library --out src/bones
npx boneyard-js build http://localhost:5173/profile --out src/bones
```

- [ ] **Step 4: Vérifier les skeletons visuellement**

Dans le navigateur, naviguer vers `/dashboard`. Pendant le chargement initial, le skeleton doit apparaître à la place du spinner. Vérifier le thème dark (si activé) — les blocs skeleton doivent utiliser la couleur `--color-border` du thème.

- [ ] **Step 5: Commiter les bones générés**

```bash
git add src/bones/*.bones.json
git commit -m "feat: add generated boneyard skeleton definitions for all pages"
```

Note : `registry.js` est dans `.gitignore` — chaque développeur doit relancer le scan pour le générer localement après `npm install`.

---

## Task 8: Vérification finale et documentation du workflow

**Files:**
- Modify: `README.md` ou créer `docs/skeleton-scan.md`

- [ ] **Step 1: Vérifier que le build de production fonctionne**

```bash
npm run build
```

Expected: build réussi, aucune erreur TypeScript.

- [ ] **Step 2: Documenter le workflow de scan**

Créer `docs/skeleton-scan.md` :

```markdown
# Skeleton Loading — Workflow de scan

## Setup initial (première fois)

1. Créer `boneyard.config.json` à la racine (voir format ci-dessous)
2. Lancer `npm run dev`
3. Dans un second terminal : `npx boneyard-js build http://localhost:5173 --out src/bones`

## Format boneyard.config.json

\`\`\`json
{
  "auth": {
    "cookies": [
      { "name": "firebaseToken", "value": "TOKEN_DU_COMPTE_SCANNER" }
    ]
  }
}
\`\`\`

Le token s'obtient depuis les DevTools (Application > Cookies) avec le compte `skeleton-scanner@bingeki.app`.

## Après un changement de layout

Rescan de la page modifiée uniquement :

\`\`\`bash
npx boneyard-js build http://localhost:5173/<route> --out src/bones
\`\`\`

Puis commiter le `.bones.json` mis à jour.

## registry.js

Ce fichier est auto-généré et non commité (dans `.gitignore`). Après un `git clone` ou `npm install`, relancer le scan pour le regénérer.
```

- [ ] **Step 3: Commit final**

```bash
git add docs/skeleton-scan.md
git commit -m "docs: add skeleton scan workflow documentation"
```

---

## Self-Review

**Spec coverage :**
- ✅ Installation boneyard-js → Task 1
- ✅ Import registry dans main.tsx → Task 1
- ✅ .gitignore boneyard.config.json → Task 1
- ✅ Wrapper toutes les pages → Tasks 2–6
- ✅ Couleurs `var(--color-border)` → Tasks 2–6 (chaque wrapper)
- ✅ Compte test Firebase → Task 7 prérequis
- ✅ Scan CLI → Task 7
- ✅ Pages statiques hors scope (FormSurveyThankYou) → absent du plan ✓
- ✅ Modales hors scope → absent du plan ✓

**Cohérence des noms :**
- Les `name=` dans les wrappers correspondent exactement aux noms de fichiers `.bones.json` attendus dans la spec.

**Point d'attention :** `registry.js` est dans `.gitignore` — les développeurs doivent savoir relancer le scan. Couvert par Task 8 (docs).
