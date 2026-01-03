export interface ChangelogEntry {
    version: string;
    date: string;
    title: string;
    description: string;
    changes: string[];
}

export const changelogData: ChangelogEntry[] = [
    {
        version: "v2.4",
        date: "03 Janvier 2026",
        title: "Profondeur de Données",
        description: "Une immersion totale avec les détails du casting et les statistiques de la communauté.",
        changes: [
            "Casting Enrichi : Découvrez les Seiyuu (doubleurs) originaux sous chaque personnage.",
            "Statistiques : Visualisez la popularité et la répartition des notes de l'œuvre.",
            "Visualisation Brutaliste : Nouveaux graphiques pour les scores et le statut de visionnage.",
            "Optimisation de la structure de la page Détails."
        ]
    },
    {
        version: "v2.3",
        date: "03 Janvier 2026",
        title: "Discovery & Immersion",
        description: "Enrichissement visuel et découverte de nouvelles pépites.",
        changes: [
            "Nouvel onglet 'Galerie' : Explorez les artworks officiels en haute qualité.",
            "Section 'Vous Aimerez Aussi' : Recommandations basées sur les votes de la communauté.",
            "Intégration d'une modale 'Click-to-Zoom' pour les images.",
            "Amélioration UX : Stop de l'autoplay vidéo et optimisation des grilles.",
            "Nouvel onglet 'MUSIQUES' : Écoutez tous les openings et endings avec recherche YouTube intégrée."
        ]
    },
    {
        version: "v2.2",
        date: "03 Janvier 2026",
        title: "Deep Dive Update",
        description: "Plongez au cœur de vos œuvres préférées avec le Casting et l'Univers Étendu.",
        changes: [
            "Ajout de la section 'Casting' : Les 10 personnages principaux en un coup d'œil.",
            "Ajout de la section 'Univers Étendu' : Navigation facile entre préquels, suites et side-stories.",
            "Nouveau style de scroll horizontal 'Invisible' pour une esthétique ultra-clean.",
            "Optimisation des performances API (Chargement parallèle des détails)."
        ]
    },
    {
        version: "v2.1",
        date: "03 Janvier 2026",
        title: "L'Ère des Détails",
        description: "Une mise à jour majeure pour enrichir les fiches d'anime et de manga avec des informations détaillées et interactives.",
        changes: [
            "Ajout des bandes-annonces (trailers) directement sur la page de détails.",
            "Nouvelles informations : Studios, Rang, Popularité, Saison et Année.",
            "Nouvelle page Changelog pour suivre l'historique des mises à jour.",
            "Amélioration de la synchronisation des données API vs Bibliothèque."
        ]
    },
    {
        version: "v1.5",
        date: "19 Décembre 2025",
        title: "Optimisation Mobile & Social",
        description: "Focus sur l'expérience mobile et la stabilité des fonctionnalités sociales.",
        changes: [
            "Refonte complète de l'affichage Social sur mobile (CSS Grid & Layout compact).",
            "Correction des problèmes d'affichage des graphiques et classements.",
            "Optimisation des permissions Firestore pour les fonctionnalités communautaires.",
            "Résolution des doublons dans la page Découvrir."
        ]
    },
    {
        version: "v1.4",
        date: "18 Décembre 2025",
        title: "Mobile First & Stabilité",
        description: "Améliorations cruciales pour la navigation sur petits écrans.",
        changes: [
            "Amélioration globale de la responsivité 'Bingeki Style' sur mobile.",
            "Correction des problèmes de redimensionnement des graphiques.",
            "Injecton correcte des IDs utilisateurs dans les profils."
        ]
    },
    {
        version: "v1.3",
        date: "17 Décembre 2025",
        title: "Community & Feedback",
        description: "Introduction des fonctionnalités communautaires avancées et gestion des retours.",
        changes: [
            "Système de commentaires avancé avec réponses imbriquées et mentions.",
            "Nouvelle page Feedback et interface d'administration.",
            "Ajout du Rang spécial 'Niveau 100'.",
            "Sécurisation renforcée des données utilisateurs (Règles Firestore).",
            "Style Brutalist appliqué aux zones de texte et interactions."
        ]
    },
    {
        version: "v1.2",
        date: "17 Décembre 2025",
        title: "Profile 2.0 & Gamification",
        description: "Une refonte majeure de l'identité utilisateur et du système de progression.",
        changes: [
            "Nouveau Profil : Graphique de Nen, Top 3 Favoris et Badges Holographiques.",
            "Système d'invitation aux Défis et contrôles de Watch Party.",
            "Amélioration de la gestion des bannières de profil (Support URL).",
            "Mise à jour de la logique d'XP et de progression.",
            "Filtre de contenu 'SFW' activé par défaut sur l'API."
        ]
    },
    {
        version: "v1.1",
        date: "17 Décembre 2025",
        title: "Discover & UI Polish",
        description: "Amélioration de la découverte de contenu et harmonisation visuelle.",
        changes: [
            "Nouvelle interface 'Discover' avec section Hero immersive.",
            "Filtres par genre fonctionnels via l'API.",
            "Harmonisation des boutons et cartes avec le thème Manga/Brutalist.",
            "Correction des styles de la bibliothèque (boutons, icônes stats)."
        ]
    }
];
