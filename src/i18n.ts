import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    fr: {
        translation: {
            header: {
                dashboard: "Q.G.",
                library: "BIBLIOTHÈQUE",
                agenda: "AGENDA",
                community: "COMMUNAUTÉ",
                news: "NOUVEAUTÉS",
                tierlist: "TIER LISTS",
                login: "CONNEXION",
                search_placeholder: "Rechercher...",
                discover: "DÉCOUVRIR",
                changelog: "CHANGELOG",
                profile: "Mon Profil",
                settings: "Paramètres",
                logout: "Déconnexion",
                feedback: "Avis",
                more: "PLUS"
            },
            landing: {
                hero: {
                    title: "VOTRE HISTOIRE<br />COMMENCE",
                    subtitle: "Ne soyez plus un simple spectateur. Devenez le protagoniste.",
                    cta: "COMMENCER L'AVENTURE"
                },
                features: {
                    qg: {
                        title: "LE Q.G.",
                        description_1: "Organisez votre vidéothèque comme un stratège.",
                        description_2: "Séparez vos lectures en cours, vos pauses, et vos archives. Ne perdez plus jamais le fil de vos intrigues favorites.",
                        check_chapters: "CHAPITRES",
                        check_episodes: "ÉPISODES",
                        check_volumes: "TOMES"
                    },
                    progression: {
                        title: "PROGRESSION",
                        description_1: "Chaque chapitre lu vous rend plus fort.",
                        description_2: "Gagnez de l'XP en mettant à jour votre liste. Débloquez des <strong>Badges Holographiques</strong> et grimpez les rangs de la Hunter Society.",
                        stats_title: "STATISTIQUES DÉTAILLÉES"
                    },
                    exploration: {
                        title: "EXPLORATION",
                        description_1: "Une base de données infinie à portée de main.",
                        description_2: "Recherchez parmis des milliers d'Anime et Manga. Filtrez par genre, score, ou popularité. Trouvez votre prochaine addiction en quelques secondes.",
                        search_placeholder: "Rechercher un anime, un manga...",
                        genres: {
                            seinen: "Seinen",
                            shonen: "Shonen",
                            romance: "Romance",
                            horror: "Horreur",
                            isekai: "Isekai"
                        }
                    },
                    community: {
                        title: "COMMUNAUTÉ",
                        description_1: "Vous n'êtes pas seul dans ce monde.",
                        description_2: "Suivez l'activité de vos amis. Partagez vos avis sans spoil. Comparez vos collections et vos badges.",
                        friends: "AMIS",
                        debates: "DÉBATS",
                        share: "PARTAGE",
                        see_discussion: "VOIR LA DISCUSSION",
                        comments: {
                            levi: "Ce chapitre était incroyable !! 🔥",
                            armin: "Je ne m'attendais pas à ça...",
                            mikasa: "Eren..."
                        }
                    },
                    details: {
                        title: "TOUT SAVOIR",
                        description_1: "Plongez au cœur de vos œuvres.",
                        description_2: "Synopsis, staff, statistiques détaillées, personnages... Accédez à une fiche d'identité complète pour chaque Anime et Manga. Ne ratez aucun détail.",
                        mock_card: {
                            general: "GÉNÉRAL",
                            chapters: "CHAPITRES",
                            stats: "STATS",
                            reviews: "AVIS",
                            manga: "MANGA",
                            ongoing: "EN COURS",
                            view_full: "VOIR LA FICHE COMPLÈTE",
                            synopsis: "Pour sauver ses amis, Yuji Itadori avale un doigt maudit et partage désormais son corps avec Ryomen Sukuna, le plus puissant des fléaux."
                        }
                    },
                    wip: {
                        title: "WORK IN PROGRESS",
                        description_1: "Bingeki est vivant. Il évolue.",
                        description_2: "Je construis cette plateforme avec vous. Suivez chaque mise à jour, suggérez des fonctionnalités, et voyez vos idées prendre vie.",
                        roadmap_btn: "VOIR LA ROADMAP",
                        timeline: {
                            feedback_title: "Feedback & Changelog 2.0",
                            feedback_desc: "Refonte complète du système de feedback et de l'affichage des mises à jour.",
                            guilds_title: "Système de \"Guildes\"",
                            guilds_desc: "Créez votre propre clan, participez à des guerres de guildes et dominez le classement.",
                            soon: "SOON"
                        }
                    },
                    support: {
                        sfx: "MECÈNE",
                        tag: "TIPS FOR DEVS",
                        title: "SOUTENEZ LE PROJET",
                        description_1: "Bingeki est développé avec ❤️ en open-source",
                        description_2: "Si Bingeki enrichit votre expérience manga/anime, aidez à financer le développement de nouvelles fonctionnalités. Chaque café compte ! ☕",
                        features: "Nouvelles features",
                        servers: "Serveurs performants",
                        premium: "Support premium",
                        kofi_alt: "Support me on Ko-fi"
                    },
                    final_cta: {
                        title: "REJOIGNEZ L'ÉLITE",
                        button: "CRÉER MON COMPTE"
                    }
                }
            },
            hunter_license: {
                title: "HUNTER LICENSE",
                top_3: "Top 3 Favoris",
                favorite: "FAVORI",
                id_prefix: "ID",
                logout: "DECONNEXION"
            },
            stats: {
                level: "Niveau",
                xp: "EXPÉRIENCE",
                passion: "Passion",
                diligence: "Assiduité",
                collection: "Collection",
                reading: "Lecture",
                completion: "Complétion",
                streak: "Jours Streak",
                badges: "Badges",
                chart_title: "GRAPH DU CHASSEUR",
                legend: {
                    title: "CALCUL DES STATS",
                    level: "Level × 2 (max 100)",
                    passion: "XP ÷ 100 (max 100)",
                    diligence: "Jours de streak (max 100)",
                    collection: "Œuvres ÷ 2 (max 100)",
                    reading: "Chapitres ÷ 10 (max 100)",
                    completion: "Complétés × 5 (max 100)"
                }
            },
            footer: {
                tbc: "TO BE CONTINUED",
                feedback: "DONNER MON AVIS",
                copyright: "Bingeki Experience.",
                changelog: "CHANGELOG",
                legal: "MENTIONS LÉGALES & RGPD",
                credits: "CRÉDITS",
                contribution_msg: "Chaque contribution aide à ajouter de nouvelles fonctionnalités !"
            },
            dashboard: {
                rank: "RANK",
                hero_default: "Héros",
                discover_btn: "Découvrir",
                profile_btn: "PROFIL",
                goal: "Objectif",
                weekly: "Hebdo",
                chapters_read: "chapitres lus",
                streak: "Série",
                days: "jours",
                chapter: "Chapitre",
                continue_reading: "Continuer la lecture",
                in_progress: "En cours",
                see_all: "TOUT VOIR",
                no_reading: "Aucune lecture en cours",
                discover: "DÉCOUVRIR",
                friends_activity: "Activité amis",
                loading: "Chargement...",
                no_activity: "Pas encore d'activité",
                add_friends: "Ajouter des amis",
                see_all_activity: "VOIR TOUTE L'ACTIVITÉ",
                to_discover: "À DÉCOUVRIR",
                see_more_suggestions: "VOIR PLUS DE SUGGESTIONS",
                just_now: "À l'instant",
                hours_ago: "Il y a {{hours}}h",
                days_ago: "Il y a {{days}}j"
            },
            library: {
                total: "Total",
                completed: "Terminées",
                progression: "Progression",
                add_work: "AJOUTER UNE ŒUVRE",
                search: "Rechercher...",
                filters: "FILTRES",
                type: "TYPE",
                all: "TOUS",
                status: "STATUT",
                sort: {
                    recent: "Récents",
                    added: "Ajoutés",
                    alphabetical: "A-Z",
                    progress: "Progression"
                },
                view_grid: "Vue Grille",
                view_list: "Vue Liste",
                export: "Exporter",
                import: "Importer",
                select: "SÉLECTIONNER",
                cancel: "ANNULER",
                delete_selected: "SUPPRIMER",
                delete_confirm: "Supprimer {{count}} œuvres ?",
                deleted_success: "{{count}} œuvres supprimées",
                deleted_single: "\"{{title}}\" a été supprimé",
                data_imported: "Données importées !",
                error: "Erreur",
                no_works: "Aucune œuvre trouvée",
                delete_title: "SUPPRESSION",
                delete_question: "Supprimer \"{{title}}\" ?",
                delete_warning: "Cette action est irréversible. Votre progression et vos notes seront perdues.",
                delete_btn: "SUPPRIMER",
                delete_work: "Supprimer l'oeuvre",
                episode: "Ep.",
                chapter: "Ch."
            },
            auth: {
                back: "RETOUR",
                hero_title: "VOTRE<br />AVENTURE<br />COMMENCE",
                hero_subtitle: "Rejoignez Bingeki pour transformer votre passion manga en une véritable quête RPG.",
                feature_rpg: "Suivi RPG",
                feature_progression: "Progression",
                welcome_back: "BON RETOUR !",
                create_account: "CRÉER UN COMPTE",
                resume_progress: "Reprenez votre progression",
                start_legend: "Commencez votre légende",
                placeholder_pseudo: "Pseudo",
                placeholder_email: "Email",
                placeholder_password: "Mot de passe",
                login_btn: "SE CONNECTER",
                register_btn: "S'INSCRIRE",
                or: "OU",
                google_login: "CONTINUER AVEC GOOGLE",
                no_account: "Pas encore de compte ? S'inscrire",
                has_account: "Déjà un compte ? Se connecter",
                error_pseudo: "Veuillez entrer un pseudo",
                error_generic: "Une erreur est survenue",
                mobile_title: "VOTRE AVENTURE",
                mobile_subtitle: "Suivez vos mangas, gagnez de l'XP et défiez vos amis."
            },
            feedback: {
                success_icon: "💌",
                success_title: "MERCI !",
                success_message: "Votre avis a bien été reçu. C'est grâce à vous que Bingeki s'améliore !",
                back_home: "Retour à l'accueil",
                title: "AIDEZ-NOUS À PROGRESSER",
                subtitle_1: "Bug trouvé ? Idée de génie ? Ou juste envie de dire bonjour ?",
                subtitle_2: "Votre avis compte énormément pour l'évolution de la plateforme.",
                rating_label: "Votre Note Globale",
                category_label: "C'est à propos de quoi ?",
                category_bug: "UN BUG",
                category_idea: "UNE IDÉE",
                category_general: "GÉNÉRAL",
                message_label: "Votre Message",
                message_placeholder: "Dites-nous tout...",
                email_label: "Email (Optionnel)",
                email_placeholder: "Pour vous recontacter si besoin...",
                submit_sending: "ENVOI...",
                submit_btn: "ENVOYER MON AVIS",
                toast_select_rating: "Veuillez sélectionner une note",
                toast_write_message: "Veuillez écrire un message",
                toast_success: "Merci pour votre retour !",
                toast_error: "Erreur lors de l'envoi. Réessayez.",
                toast_unexpected: "Erreur inattendue."
            },
            components: {
                add_work_modal: {
                    title: "RECRUTER UNE ŒUVRE",
                    tab_search: "Recherche",
                    tab_manual: "Manuel",
                    search_placeholder: "Rechercher (ex: Naruto, Berserk...)",
                    no_results: "Aucune trace détectée...",
                    search_hint: "TAPEZ UN NOM POUR LANCER LA TRAQUE",
                    label_title: "TITRE",
                    title_placeholder: "Titre de l'œuvre...",
                    label_type: "TYPE",
                    label_chapters: "CHAPITRES",
                    label_episodes: "ÉPISODES",
                    total_placeholder: "Total...",
                    label_image: "IMAGE (OPTIONNEL)",
                    drag_and_drop: "Glissez une image ou cliquez pour upload",
                    or_paste_url: "Ou collez une URL ci-dessous",
                    url_placeholder: "Ou URL de l'image...",
                    add_work: "AJOUTER L'ŒUVRE",
                    chapters_abbr: "Chaps",
                    episodes_abbr: "Éps"
                },
                challenges_section: {
                    title: "MES DÉFIS",
                    types: {
                        race_to_finish: "Course à la fin",
                        most_chapters: "Plus de chapitres",
                        streak_battle: "Battle de Streak"
                    },
                    new_challenge: "NOUVEAU DÉFI",
                    loading: "Chargement...",
                    no_challenges: "Aucun défi en cours",
                    no_challenges_hint: "Créez un défi et affrontez vos amis !",
                    login_required: "Connectez-vous pour voir vos défis",
                    status_active: "En cours",
                    status_pending: "En attente",
                    status_completed: "Terminé",
                    you: "(Vous)",
                    days: "jours",
                    chapters_abbr: "ch.",
                    accept: "Accepter",
                    decline: "Refuser",
                    cancel: "Annuler",
                    modal_title: "NOUVEAU DÉFI",
                    challenge_name: "Nom du défi",
                    challenge_name_placeholder: "Ex: Qui finira One Piece en premier ?",
                    challenge_type: "Type de défi",
                    challenge_work: "Œuvre du défi",
                    add_works_hint: "Ajoutez des œuvres à votre bibliothèque",
                    invite_friends: "Inviter des amis",
                    selected: "sélectionnés",
                    no_friends: "Vous n'avez pas encore d'amis",
                    cancel_btn: "Annuler",
                    create_btn: "Créer le défi",
                    toast_fill_fields: "Remplissez tous les champs et sélectionnez des amis",
                    toast_created: "Défi créé !",
                    toast_accepted: "Défi accepté !",
                    toast_declined: "Défi refusé",
                    toast_cancelled: "Défi annulé"
                },
                progress_button: {
                    completed: "Terminé"
                },
                xp_bar: {
                    level: "NIV"
                }
            },
            challenges: {
                title: "DÉFIS (En construction)",
                description: "Cette page est en cours de développement."
            },
            schedule: {
                title: "CALENDRIER DES SORTIES",
                subtitle: "Ne ratez jamais un épisode ! Les horaires sont basés sur la diffusion japonaise.",
                days: {
                    monday: "Lundi",
                    tuesday: "Mardi",
                    wednesday: "Mercredi",
                    thursday: "Jeudi",
                    friday: "Vendredi",
                    saturday: "Samedi",
                    sunday: "Dimanche"
                },
                unknown_time: "Heure inconnue",
                no_anime: "Aucun anime trouvé pour ce jour... C'est calme ! 🍃"
            },
            discover: {
                guest_banner: {
                    title: "✨ Créez un compte pour débloquer toutes les fonctionnalités !",
                    subtitle: "Bibliothèque personnelle, suivi de progression, badges, classements et plus encore...",
                    cta: "S'inscrire gratuitement"
                },
                hero: {
                    featured: "A LA UNE",
                    add_to_list: "AJOUTER À MA LISTE",
                    more_details: "PLUS DE DÉTAILS"
                },
                search: {
                    placeholder: "Rechercher un anime, un manga...",
                    results_title: "Résultats de la recherche",
                    no_results: "Aucun résultat trouvé. Essayez de relâcher les filtres !"
                },
                filters: {
                    status: "Statut",
                    all: "TOUS",
                    airing: "EN COURS",
                    complete: "TERMINÉ",
                    upcoming: "À VENIR",
                    rating: "Public",
                    all_ages: "TOUT PUBLIC",
                    teen: "ADO (PG-13)",
                    adult: "ADULTE (R-17)",
                    min_score: "Score Min",
                    year: "Année",
                    year_placeholder: "ex: 2024",
                    studio: "Studio",
                    all_studios: "TOUS LES STUDIOS",
                    reset: "Réinitialiser",
                    genre: "Genre",
                    score: "Score"
                },
                surprise: {
                    title: "En panne d'inspiration ?",
                    subtitle: "Laisse le destin choisir ta prochaine aventure.",
                    button: "SURPRENDS-MOI"
                },
                carousels: {
                    seasonal: "Anime de la Saison",
                    top_anime: "Top 10 Animes",
                    popular_manga: "Mangas Populaires",
                    top_manga: "Top 10 Mangas"
                }
            },
            social: {
                title: "SOCIAL",
                tabs: {
                    ranking: "CLASSEMENT",
                    activity: "ACTIVITÉ",
                    challenges: "DÉFIS",
                    parties: "PARTIES",
                    friends: "AMIS"
                },
                activity: {
                    title: "Activité de tes amis",
                    loading: "Chargement...",
                    no_activity: "Aucune activité récente de tes amis.",
                    add_friends_hint: "Ajoute des amis pour voir leur activité !",
                    time: {
                        less_than_hour: "Il y a moins d'une heure",
                        hours_ago: "Il y a {{hours}}h",
                        days_ago: "Il y a {{days}}j"
                    }
                },
                ranking: {
                    filter_by: "Par :",
                    xp: "XP",
                    chapters: "Chapitres",
                    streak: "Streak",
                    anonymous: "Anonyme",
                    pending: "En attente"
                },
                friends: {
                    add_title: "AJOUTER UN AMI",
                    search_placeholder: "Pseudo ou Email exact...",
                    search_btn: "CHERCHER",
                    request_sent: "DEMANDE ENVOYÉE",
                    add_btn: "AJOUTER",
                    not_found: "Aucun utilisateur trouvé avec cet email.",
                    requests_title: "DEMANDES REÇUES",
                    accept: "ACCEPTER",
                    no_friends: "Vous n'avez pas encore d'amis. Lancez une recherche !",
                    request_sent_toast: "Demande envoyée à {{name}} !",
                    request_error: "Erreur lors de l'envoi de la demande.",
                    reject_success: "Demande refusée et supprimée.",
                    reject_error: "Erreur lors du refus de la demande. Veuillez réessayer."
                }
            },
            profile: {
                title: "Fiche de Chasseur",
                edit: "EDITER",
                guide: "GUIDE",
                back: "RETOUR",
                loading: "Chargement du profil...",
                chapters_read: "Chapitres lus",
                in_progress: "En cours",
                completed: "Terminées",
                collection: "Collection",
                badges: "Badges",
                xp_total: "XP Total",
                common_works: "{{count}} œuvre en commun",
                common_works_plural: "{{count}} œuvres en commun",
                recent_badges: "Badges Récents",
                edit_modal: {
                    title: "EDITER LA LICENSE",
                    banner_label: "BANNIÈRE / GIF (Lien URL)",
                    banner_help: "Copiez l'adresse d'une image (clic droit > Copier l'adresse de l'image) et collez-la ici.",
                    banner_placeholder: "https://exemple.com/image.jpg",
                    colors: "COULEURS",
                    accent: "ACCENT",
                    background: "FOND",
                    border: "BORDURE",
                    top3: "TOP 3 FAVORIS",
                    select_favorite: "Sélectionner un favori #{{index}}",
                    featured_badge: "BADGE EN VEDETTE",
                    none: "Aucun",
                    bio: "BIO / CITATION",
                    bio_placeholder: "Une phrase qui vous définit...",
                    save: "ENREGISTRER"
                },
                guide_modal: {
                    title: "Guide du Chasseur",
                    xp_title: "EXPERIENCE (XP)",
                    xp_desc: "Gagnez de l'XP à chaque action sur Bingeki :",
                    xp_read: "Lire un chapitre :",
                    xp_add: "Ajouter une œuvre :",
                    xp_complete: "Terminer une œuvre :",
                    xp_daily: "Connexion quotidienne :",
                    streak_title: "STREAK",
                    streak_desc: "La flamme de votre passion ! 🔥 Connectez-vous chaque jour pour augmenter votre Streak.",
                    streak_warning: "Attention : si vous ratez un jour, la flamme s'éteint et retombe à 0.",
                    ranks_title: "Gagner des Rangs",
                    ranks_desc: "En accumulant de l'XP, vous montez de niveau et de rang (F -> S). Débloquez des badges uniques pour montrer vos exploits sur votre profil !"
                },
                toast: {
                    profile_updated: "Profil mis à jour avec succès !",
                    save_error: "Erreur lors de la sauvegarde : "
                }
            },
            settings: {
                title: "Paramètres",
                appearance: {
                    title: "APPARENCE",
                    accent_color: "Couleur d'accentuation",
                    spoiler_mode: "Mode Spoiler",
                    spoiler_enabled: "Mode Spoiler activé",
                    spoiler_disabled: "Mode Spoiler désactivé",
                    spoiler_help: "Floute les synopsis pour éviter les révélations."
                },
                colors: {
                    red: "Rouge Bingeki",
                    cyan: "Cyan Futur",
                    green: "Vert Toxique",
                    yellow: "Jaune Solaire",
                    purple: "Violet Royal"
                },
                preferences: {
                    title: "PRÉFÉRENCES",
                    reduce_motion: "Réduire les animations",
                    sound_effects: "Effets sonores (UI)",
                    notifications: "Notifications"
                },
                data: {
                    title: "GESTION DES DONNÉES",
                    storage_used: "Espace utilisé",
                    storage_local: "{{size}} MB stockés localement",
                    clear_cache: "Nettoyer Cache",
                    export_backup: "Exporter Backup",
                    import_backup: "Importer Backup",
                    sync_library: "Synchroniser la bibliothèque",
                    danger_zone: "Zone de danger",
                    danger_desc: "Actions irréversibles",
                    reset_all: "Reset All",
                    delete_account: "Supprimer Compte",
                    confirm_sure: "Sûr ?",
                    no: "Non",
                    yes_reset: "Oui, Reset",
                    cancel: "Annuler",
                    delete_confirm_title: "SUPPRIMER DÉFINITIVEMENT ?",
                    delete_confirm_desc: "Cette action supprimera votre compte, votre bibliothèque et toute votre progression. Impossible d'annuler.",
                    goodbye: "ADIEU"
                },
                about: {
                    title: "À PROPOS",
                    version: "Version 1.0.0 (Alpha)",
                    made_with: "Développé avec ❤️ pour les fans d'anime et de manga.",
                    credits: "Données fournies par l'API Jikan (MyAnimeList). Les images et titres appartiennent à leurs créateurs respectifs."
                },
                sync: {
                    no_works: "Aucune œuvre à synchroniser",
                    complete: "Synchronisation terminée : {{count}} mis à jour",
                    error: "Erreur lors de la synchronisation",
                    button: "Synchroniser"
                },
                toast: {
                    reset_success: "Toutes les données ont été réinitialisées !",
                    reset_error: "Erreur lors de la réinitialisation",
                    import_success: "Données importées avec succès !",
                    import_error: "Échec de l'importation",
                    account_deleted: "Compte supprimé. Sayonara.",
                    relogin_required: "Veuillez vous reconnecter pour supprimer votre compte",
                    delete_error: "Erreur lors de la suppression",
                    cache_cleared: "Cache nettoyé (simulation)"
                }
            },
            changelog: {
                title: "JOURNAL DE BORD",
                subtitle: "L'historique des évolutions de la plateforme Bingeki.",
                updates: "Mises à jour",
                current_version: "Version Actuelle",
                new: "NEW",
                to_be_continued: "TO BE CONTINUED..."
            },
            legal: {
                back: "RETOUR",
                title: "MENTIONS LÉGALES & RGPD",
                section1_title: "1. ÉDITEUR DU SITE",
                name: "Nom :",
                address: "Adresse :",
                contact: "Contact :",
                status: "Statut :",
                status_value: "Développeur Freelance / Projet Personnel",
                section2_title: "2. HÉBERGEMENT",
                hosting_text: "Ce site est hébergé par Firebase (Google LLC).",
                hosting_data: "Certaines données (images) peuvent être stockées via d'autres services tiers.",
                section3_title: "3. PROPRIÉTÉ INTELLECTUELLE",
                ip_design: "Le design, la structure et le code de \"Bingeki Experience\" sont la propriété exclusive de l'éditeur.",
                ip_images: "Les images d'œuvres (mangas/animes) sont utilisées à titre d'illustration et restent la propriété de leurs ayants droit respectifs.",
                section4_title: "4. DONNÉES PERSONNELLES (RGPD)",
                gdpr_intro: "Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que :",
                gdpr_collect_title: "Collecte :",
                gdpr_collect: "Les données collectées (email, image de profil, progression) sont uniquement utilisées pour le fonctionnement de l'application (sauvegarde de la bibliothèque, gamification).",
                gdpr_responsible_title: "Responsable :",
                gdpr_responsible: "Moussandou Mroivili est le responsable du traitement des données.",
                gdpr_access_title: "Droit d'accès :",
                gdpr_access: "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez supprimer votre compte et toutes les données associées directement depuis les paramètres de l'application ou en nous contactant.",
                gdpr_share_title: "Partage :",
                gdpr_share: "Aucune donnée personnelle n'est vendue à des tiers.",
                gdpr_cookies_title: "Cookies :",
                gdpr_cookies: "Ce site utilise uniquement des cookies techniques nécessaires à l'authentification (Firebase Auth).",
                section5_title: "5. CONTACT",
                contact_text: "Pour toute question relative à ces mentions légales ou à vos données, veuillez contacter :"
            },
            credits: {
                title: "CRÉDITS",
                role: "DEVELOPER & CREATOR",
                description_1: "<strong>Bingeki</strong> est né d'une passion pour le manga et l'envie de créer une expérience utilisateur unique.",
                description_2: "Développé avec amour, café et beaucoup de CSS. Ce projet est une démonstration de ce qui est possible quand on mélange design brutaliste et technologies modernes.",
                made_with: "Fait avec",
                in_marseille: "à Marseille"
            },
            admin: {
                sidebar: {
                    admin_panel: "ADMIN PANEL",
                    dashboard: "Dashboard",
                    users: "Utilisateurs",
                    feedback: "Feedback",
                    system: "Système",
                    back_to_site: "Retour au site",
                    exit: "Exit"
                },
                dashboard: {
                    loading: "Chargement du dashboard...",
                    title: "Centre de Contrôle",
                    subtitle: "Vue d'ensemble de l'activité sur Bingeki",
                    users_label: "Utilisateurs",
                    today: "aujourd'hui",
                    feedback_label: "Feedback",
                    tickets_pending: "tickets en attente",
                    system_label: "Système",
                    activity_volume: "Volume d'Activité",
                    last_7_days: "DERNIERS 7 JOURS",
                    recent_members: "Derniers Membres",
                    anonymous: "Anonyme",
                    quick_actions: "Actions Rapides",
                    manage_users: "Gérer Utilisateurs",
                    view_feedback: "Voir Feedback",
                    live_console: "Live Console"
                },
                users: {
                    title: "Gestion Utilisateurs",
                    members_count: "{{count}} membres enregistrés",
                    search_placeholder: "Rechercher (Email, Pseudo...)",
                    loading: "Chargement...",
                    no_name: "Sans nom",
                    ban: "Bannir",
                    admin: "Admin",
                    view_profile: "Voir Profil",
                    ban_yes: "OUI",
                    ban_no: "NON",
                    confirm_ban: "Voulez-vous vraiment {{action}} cet utilisateur ?",
                    confirm_admin: "ATTENTION: {{action}} les droits administrateur ?",
                    update_error: "Erreur lors de la mise à jour",
                    action_ban: "bannir",
                    action_unban: "débannir",
                    action_give: "Donner",
                    action_remove: "Retirer"
                },
                feedback: {
                    title: "Feedback Center",
                    tickets_pending: "{{count}} tickets en attente",
                    refresh: "Rafraîchir",
                    loading: "Chargement des messages...",
                    no_messages: "Aucun message pour le moment.",
                    anonymous: "Anonyme",
                    resolved: "Résolu",
                    reply: "Répondre",
                    no_email: "Pas d'email",
                    reopen: "Rouvrir",
                    mark_resolved: "Marquer comme résolu",
                    delete: "Supprimer",
                    confirm_delete: "Supprimer ce feedback définitivement ?",
                    delete_error: "Erreur lors de la suppression",
                    status_error: "Erreur lors de la mise à jour du statut"
                },
                system: {
                    title: "Système & Logs",
                    subtitle: "Monitoring temps réel et configuration globale",
                    global_announcement: "Annonce Globale",
                    message_placeholder: "Message pour tous les utilisateurs...",
                    info: "INFO",
                    alert: "ALERT",
                    enable_announcement: "Activer l'annonce",
                    update_live: "Mettre à jour (LIVE)",
                    save_offline: "Sauvegarder (Hors-ligne)",
                    server_config: "Configuration Serveur",
                    maintenance_mode: "Mode Maintenance",
                    maintenance_desc: "Bloque l'accès sauf aux admins",
                    registrations: "Inscriptions",
                    registrations_desc: "Autoriser les nouveaux membres",
                    database: "Base de Données",
                    data_shield: "Data Shield Protocol v3.0 Active",
                    manual_backup: "Lancer Backup Manuel",
                    live: "LIVE"
                },
                work_details: {
                    back: "RETOUR",
                    loading: "CHARGEMENT...",
                    not_found: "ŒUVRE INTROUVABLE",
                    not_found_desc: "Impossible de récupérer les détails. Vérifiez votre connexion ou l'ID.",
                    tabs: {
                        general: "GÉNÉRAL",
                        chapters_list: "LISTE DES CHAPITRES",
                        episodes_list: "LISTE DES ÉPISODES",
                        music: "MUSIQUES",
                        reviews: "AVIS",
                        gallery: "GALERIE",
                        stats: "STATISTIQUES"
                    },
                    meta: {
                        score: "Score",
                        chaps: "Chaps",
                        eps: "Eps"
                    },
                    streaming: {
                        watch_on: "Regarder sur",
                        watch: "REGARDER",
                        read: "LIRE",
                        search_episode: "Recherche Google - Épisode",
                        search_chapter: "Lire - Chapitre"
                    },
                    synopsis: {
                        title: "SYNOPSIS",
                        show_less: "Moins",
                        show_more: "Lire la suite"
                    },
                    info: {
                        season: "SAISON",
                        studio: "STUDIO",
                        rank: "RANG",
                        popularity: "POPULARITÉ"
                    },
                    trailer: {
                        title: "BANDE-ANNONCE",
                        watch: "REGARDER LA BANDE-ANNONCE",
                        close: "FERMER"
                    },
                    casting: {
                        title: "CASTING",
                        show_more: "VOIR PLUS",
                        show_less: "VOIR MOINS"
                    },
                    universe: {
                        title: "UNIVERS ÉTENDU",
                        collapse: "Réduire",
                        expand: "Voir {{count}} de plus"
                    },
                    library: {
                        interested: "INTÉRESSÉ ?",
                        add_desc: "Ajoutez cette œuvre à votre bibliothèque pour suivre votre progression !",
                        add_to_collection: "AJOUTER À MA COLLECTION",
                        login_to_add: "SE CONNECTER POUR AJOUTER",
                        added_toast: "Ajouté à votre bibliothèque !"
                    },
                    progress: {
                        title: "PROGRESSION",
                        edit: "Éditer",
                        saved_toast: "Progression sauvegardée !"
                    },
                    status: {
                        title: "STATUT"
                    },
                    rating: {
                        title: "MA NOTE"
                    },
                    notes: {
                        title: "MES NOTES",
                        placeholder: "Écrivez vos pensées ici..."
                    },
                    comments: {
                        title: "COMMENTAIRES",
                        time_now: "À l'instant",
                        time_hours: "Il y a {{hours}}h",
                        time_days: "Il y a {{days}}j",
                        reply: "RÉPONDRE",
                        reply_to: "Répondre à {{name}}...",
                        spoiler: "SPOILER",
                        friends_reading: "{{count}} ami(s) {{action}} aussi cette œuvre",
                        friends_watching: "regarde",
                        friends_reading_action: "lit",
                        share_opinion: "Partagez votre avis...",
                        contains_spoilers: "Contient des spoilers",
                        publish: "PUBLIER",
                        login_to_comment: "Connectez-vous pour commenter",
                        loading: "Chargement des commentaires...",
                        no_comments: "Aucun commentaire. Soyez le premier !",
                        error_loading: "Erreur de chargement :",
                        permission_error: "Vous n'avez pas la permission de voir les commentaires (Règles Firestore).",
                        generic_error: "Impossible de charger les commentaires.",
                        added_toast: "Commentaire ajouté !",
                        error_toast: "Erreur lors de l'ajout du commentaire",
                        reply_added_toast: "Réponse ajoutée !",
                        reply_error_toast: "Erreur lors de la réponse",
                        show_less: "▲ Réduire",
                        show_more: "▼ Voir {{count}} de plus",
                        reading: "Vous et {{count}} ami(s) lisent aussi cette œuvre",
                        watching: "Vous et {{count}} ami(s) regardez aussi cette œuvre",
                        placeholder: "Partagez votre avis (sans spoil de préférence)...",
                        submit: "PUBLIER"
                    },
                    danger: {
                        delete: "Supprimer de la bibliothèque",
                        deleted_toast: "\"{{title}}\" a été supprimé"
                    },
                    delete_modal: {
                        title: "SUPPRESSION",
                        confirm: "Supprimer \"{{title}}\" ?",
                        warning: "Cette action est irréversible. Votre progression et vos notes seront perdues.",
                        cancel: "ANNULER",
                        delete: "SUPPRIMER"
                    },
                    stats_tab: {
                        no_data: "Aucune statistique ou information de staff disponible pour cette œuvre.",
                        staff_title: "STAFF (PRINCIPAL)",
                        statistics_title: "STATISTIQUES",
                        in_libraries: "DANS LES BIBLIOTHÈQUES",
                        status_watching: "En cours",
                        status_completed: "Terminé",
                        status_on_hold: "En pause",
                        status_dropped: "Abandonné",
                        status_plan_to_watch: "À voir",
                        members_scores: "NOTES DES MEMBRES"
                    },
                    reviews_tab: {
                        title: "AVIS DE LA COMMUNAUTÉ (MyAnimeList)",
                        read_full: "LIRE L'AVIS COMPLET",
                        no_reviews: "AUCUN AVIS TROUVÉ",
                        no_reviews_desc: "Soyez le premier à donner votre avis dans la section commentaires ci-dessous !"
                    },
                    gallery_tab: {
                        title: "GALERIE OFFICIELLE",
                        no_images: "Aucune image disponible."
                    },
                    themes_tab: {
                        title: "BANDES ORIGINALES",
                        openings: "OPENINGS",
                        endings: "ENDINGS",
                        no_opening: "Aucun opening trouvé.",
                        no_ending: "Aucun ending trouvé.",
                        no_music: "Aucune musique (opening/ending) disponible."
                    },
                    recommendations: {
                        title: "VOUS AIMEREZ AUSSI",
                        votes: "VOTES"
                    },
                    chapters: {
                        unknown_count: "NOMBRE DE CHAPITRES INCONNU",
                        unknown_desc: "Veuillez définir le nombre total de chapitres dans l'onglet \"Général\" pour générer la liste.",
                        set_count: "Définir le nombre de chapitres",
                        prompt: "Entrez le nombre total de chapitres :",
                        prompt_total: "Entrez le nombre total:",
                        click_to_edit: "Cliquez pour modifier le total"
                    }
                },
                character_details: {
                    back: "RETOUR",
                    not_found: "Personnage introuvable.",
                    favorites: "favoris",
                    identity: "FICHE D'IDENTITÉ",
                    biography: "BIOGRAPHIE",
                    source: "Source",
                    seiyuu: "SEIYUU (DOUBLAGE JP)",
                    anime_appearances: "APPARITIONS ANIME",
                    manga_appearances: "APPARITIONS MANGA"
                }
            }
        }
    },
    en: {
        translation: {
            header: {
                dashboard: "H.Q.",
                library: "LIBRARY",
                agenda: "SCHEDULE",
                community: "COMMUNITY",
                news: "WHATS NEW",
                feedback: "FEEDBACK",
                login: "LOGIN",
                search_placeholder: "Search...",
                discover: "DISCOVER",
                changelog: "CHANGELOG",
                profile: "My Profile",
                settings: "Settings",
                logout: "Logout",
                more: "MORE",
                tierlist: "Tier List"
            },
            profile: {
                title: "Hunter License",
                edit: "EDIT",
                guide: "GUIDE",
                back: "BACK",
                loading: "Loading profile...",
                chapters_read: "Chapters read",
                in_progress: "In progress",
                completed: "Completed",
                collection: "Collection",
                badges: "Badges",
                xp_total: "Total XP",
                common_works: "{{count}} work in common",
                common_works_plural: "{{count}} works in common",
                recent_badges: "Recent Badges",
                edit_modal: {
                    title: "EDIT LICENSE",
                    banner_label: "BANNER / GIF (URL Link)",
                    banner_help: "Copy image address (right click > Copy image address) and paste it here.",
                    banner_placeholder: "https://example.com/image.jpg",
                    colors: "COLORS",
                    accent: "ACCENT",
                    background: "BACKGROUND",
                    border: "BORDER",
                    top3: "TOP 3 FAVORITES",
                    select_favorite: "Select a favorite #{{index}}",
                    featured_badge: "FEATURED BADGE",
                    none: "None",
                    bio: "BIO / QUOTE",
                    bio_placeholder: "A phrase that defines you...",
                    save: "SAVE"
                },
                guide_modal: {
                    title: "Hunter Guide",
                    xp_title: "EXPERIENCE (XP)",
                    xp_desc: "Earn XP with every action on Bingeki:",
                    xp_read: "Read a chapter:",
                    xp_add: "Add a work:",
                    xp_complete: "Complete a work:",
                    xp_daily: "Daily login:",
                    streak_title: "STREAK",
                    streak_desc: "The flame of your passion! 🔥 Log in every day to increase your Streak.",
                    streak_warning: "Warning: if you miss a day, the flame goes out and returns to 0.",
                    ranks_title: "Earning Ranks",
                    ranks_desc: "By accumulating XP, you level up and rank up (F -> S). Unlock unique badges to show off your achievements on your profile!"
                },
                toast: {
                    profile_updated: "Profile updated successfully!",
                    save_error: "Error saving: "
                }
            },
            settings: {
                title: "Settings",
                appearance: {
                    title: "APPEARANCE",
                    accent_color: "Accent Color",
                    spoiler_mode: "Spoiler Mode",
                    spoiler_enabled: "Spoiler Mode enabled",
                    spoiler_disabled: "Spoiler Mode disabled",
                    spoiler_help: "Blurs synopsis to avoid spoilers."
                },
                colors: {
                    red: "Bingeki Red",
                    cyan: "Cyan Future",
                    green: "Toxic Green",
                    yellow: "Sunny Yellow",
                    purple: "Royal Purple"
                },
                preferences: {
                    title: "PREFERENCES",
                    reduce_motion: "Reduce Motion",
                    sound_effects: "Sound Effects (UI)",
                    notifications: "Notifications"
                },
                data: {
                    title: "DATA MANAGEMENT",
                    storage_used: "Storage Used",
                    storage_local: "{{size}} MB stored locally",
                    clear_cache: "Clear Cache",
                    export_backup: "Export Backup",
                    import_backup: "Import Backup",
                    sync_library: "Sync Library",
                    danger_zone: "Danger Zone",
                    danger_desc: "Irreversible actions",
                    reset_all: "Reset All",
                    delete_account: "Delete Account",
                    confirm_sure: "Sure?",
                    no: "No",
                    yes_reset: "Yes, Reset",
                    cancel: "Cancel",
                    delete_confirm_title: "PERMANENTLY DELETE?",
                    delete_confirm_desc: "This action will delete your account, your library, and all your progress. Cannot be undone.",
                    goodbye: "GOODBYE"
                },
                about: {
                    title: "ABOUT",
                    version: "Version 1.0.0 (Alpha)",
                    made_with: "Developed with ❤️ for anime and manga fans.",
                    credits: "Data provided by Jikan API (MyAnimeList). Images and titles belong to their respective creators."
                },
                sync: {
                    no_works: "No works to sync",
                    complete: "Sync complete: {{count}} updated",
                    error: "Sync error",
                    button: "Sync"
                },
                toast: {
                    reset_success: "All data has been reset!",
                    reset_error: "Reset error",
                    import_success: "Data imported successfully!",
                    import_error: "Import failed",
                    account_deleted: "Account deleted. Sayonara.",
                    relogin_required: "Please log in again to delete your account",
                    delete_error: "Deletion error",
                    cache_cleared: "Cache cleared (simulated)"
                }
            },
            discover: {
                guest_banner: {
                    title: "✨ Create an account to unlock all features!",
                    subtitle: "Personal library, progress tracking, badges, rankings and more...",
                    cta: "Sign up for free"
                },
                hero: {
                    featured: "FEATURED",
                    add_to_list: "ADD TO MY LIST",
                    more_details: "MORE DETAILS"
                },
                search: {
                    placeholder: "Search for an anime, a manga...",
                    results_title: "Search Results",
                    no_results: "No results found. Try loosening the filters!"
                },
                filters: {
                    status: "Status",
                    all: "ALL",
                    airing: "AIRING",
                    complete: "COMPLETED",
                    upcoming: "UPCOMING",
                    rating: "Rating",
                    all_ages: "ALL AGES",
                    teen: "TEEN (PG-13)",
                    adult: "ADULT (R-17)",
                    min_score: "Min Score",
                    year: "Year",
                    year_placeholder: "e.g: 2024",
                    studio: "Studio",
                    all_studios: "ALL STUDIOS",
                    reset: "Reset",
                    genre: "Genre",
                    score: "Score"
                },
                surprise: {
                    title: "Need inspiration?",
                    subtitle: "Let fate choose your next adventure.",
                    button: "SURPRISE ME"
                },
                carousels: {
                    seasonal: "Seasonal Anime",
                    top_anime: "Top 10 Anime",
                    popular_manga: "Popular Manga",
                    top_manga: "Top 10 Manga"
                }
            },
            social: {
                title: "SOCIAL",
                tabs: {
                    ranking: "RANKING",
                    activity: "ACTIVITY",
                    challenges: "CHALLENGES",
                    parties: "PARTIES",
                    friends: "FRIENDS"
                },
                activity: {
                    title: "Your Friends' Activity",
                    loading: "Loading...",
                    no_activity: "No recent activity from your friends.",
                    add_friends_hint: "Add friends to see their activity!",
                    time: {
                        less_than_hour: "Less than an hour ago",
                        hours_ago: "{{hours}}h ago",
                        days_ago: "{{days}}d ago"
                    }
                },
                ranking: {
                    filter_by: "By:",
                    xp: "XP",
                    chapters: "Chapters",
                    streak: "Streak",
                    anonymous: "Anonymous",
                    pending: "Pending"
                },
                friends: {
                    add_title: "ADD A FRIEND",
                    search_placeholder: "Username or exact Email...",
                    search_btn: "SEARCH",
                    request_sent: "REQUEST SENT",
                    add_btn: "ADD",
                    not_found: "No user found with this email.",
                    requests_title: "RECEIVED REQUESTS",
                    accept: "ACCEPT",
                    no_friends: "You don't have any friends yet. Start a search!",
                    request_sent_toast: "Request sent to {{name}}!",
                    request_error: "Error sending the request.",
                    reject_success: "Request rejected and removed.",
                    reject_error: "Error rejecting the request. Please try again."
                }
            },
            landing: {
                hero: {
                    title: "YOUR STORY<br />BEGINS",
                    subtitle: "Don't just be a spectator. Become the protagonist.",
                    cta: "START THE ADVENTURE"
                },
                features: {
                    qg: {
                        title: "THE H.Q.",
                        description_1: "Organize your library like a strategist.",
                        description_2: "Separate your current reads, pauses, and archives. Never lose track of your favorite plots again.",
                        check_chapters: "CHAPTERS",
                        check_episodes: "EPISODES",
                        check_volumes: "VOLUMES"
                    },
                    progression: {
                        title: "PROGRESSION",
                        description_1: "Every chapter read makes you stronger.",
                        description_2: "Gain XP by updating your list. Unlock <strong>Holographic Badges</strong> and climb the ranks of the Hunter Society.",
                        stats_title: "DETAILED STATS"
                    },
                    exploration: {
                        title: "EXPLORATION",
                        description_1: "An infinite database at your fingertips.",
                        description_2: "Search among thousands of Anime and Manga. Filter by genre, score, or popularity. Find your next addiction in seconds.",
                        search_placeholder: "Search for an anime, a manga...",
                        genres: {
                            seinen: "Seinen",
                            shonen: "Shonen",
                            romance: "Romance",
                            horror: "Horror",
                            isekai: "Isekai"
                        }
                    },
                    community: {
                        title: "COMMUNITY",
                        description_1: "You are not alone in this world.",
                        description_2: "Follow your friends' activity. Share your reviews without spoilers. Compare your collections and badges.",
                        friends: "FRIENDS",
                        debates: "DEBATES",
                        share: "SHARE",
                        see_discussion: "SEE DISCUSSION",
                        comments: {
                            levi: "This chapter was incredible !! 🔥",
                            armin: "I didn't expect that...",
                            mikasa: "Eren..."
                        }
                    },
                    details: {
                        title: "KNOW EVERYTHING",
                        description_1: "Dive into the heart of your works.",
                        description_2: "Synopsis, staff, detailed stats, characters... Access a complete identity card for each Anime and Manga. Don't miss any detail.",
                        mock_card: {
                            general: "GENERAL",
                            chapters: "CHAPTERS",
                            stats: "STATS",
                            reviews: "REVIEWS",
                            manga: "MANGA",
                            ongoing: "ONGOING",
                            view_full: "VIEW FULL DETAILS",
                            synopsis: "To save his friends, Yuji Itadori swallows a cursed finger and now shares his body with Ryomen Sukuna, the most powerful of curses."
                        }
                    },
                    wip: {
                        title: "WORK IN PROGRESS",
                        description_1: "Bingeki is alive. It evolves.",
                        description_2: "I am building this platform with you. Follow every update, suggest features, and see your ideas come to life.",
                        roadmap_btn: "VIEW ROADMAP",
                        timeline: {
                            feedback_title: "Feedback & Changelog 2.0",
                            feedback_desc: "Complete overhaul of the feedback system and update display.",
                            guilds_title: "\"Guild\" System",
                            guilds_desc: "Create your own clan, participate in guild wars, and dominate the ranking.",
                            soon: "SOON"
                        }
                    },
                    support: {
                        sfx: "PATRON",
                        tag: "TIPS FOR DEVS",
                        title: "SUPPORT THE PROJECT",
                        description_1: "Bingeki is developed with ❤️ as open-source",
                        description_2: "If Bingeki enriches your manga/anime experience, help finance the development of new features. Every coffee counts! ☕",
                        features: "New features",
                        servers: "High-performance servers",
                        premium: "Premium support",
                        kofi_alt: "Support me on Ko-fi"
                    },
                    final_cta: {
                        title: "JOIN THE ELITE",
                        button: "CREATE MY ACCOUNT"
                    }
                }
            },
            hunter_license: {
                title: "HUNTER LICENSE",
                top_3: "Top 3 Favorites",
                favorite: "FAVORITE",
                id_prefix: "ID",
                logout: "LOGOUT"
            },
            stats: {
                level: "Level",
                xp: "EXPERIENCE",
                passion: "Passion",
                diligence: "Diligence",
                collection: "Collection",
                reading: "Reading",
                completion: "Completion",
                streak: "Day Streak",
                badges: "Badges",
                chart_title: "HUNTER'S GRAPH",
                legend: {
                    title: "STATS CALCULATION",
                    level: "Level × 2 (max 100)",
                    passion: "XP ÷ 100 (max 100)",
                    diligence: "Day Streak (max 100)",
                    collection: "Works ÷ 2 (max 100)",
                    reading: "Chapters ÷ 10 (max 100)",
                    completion: "Completed × 5 (max 100)"
                }
            },
            footer: {
                tbc: "TO BE CONTINUED",
                feedback: "GIVE FEEDBACK",
                copyright: "Bingeki Experience.",
                changelog: "CHANGELOG",
                legal: "LEGAL & GDPR",
                credits: "CREDITS",
                contribution_msg: "Every contribution helps add new features!"
            },
            dashboard: {
                rank: "RANK",
                hero_default: "Hero",
                discover_btn: "Discover",
                profile_btn: "PROFILE",
                goal: "Goal",
                weekly: "Weekly",
                chapters_read: "chapters read",
                streak: "Streak",
                days: "days",
                chapter: "Chapter",
                continue_reading: "Continue reading",
                in_progress: "In progress",
                see_all: "SEE ALL",
                no_reading: "No reading in progress",
                discover: "DISCOVER",
                friends_activity: "Friends activity",
                loading: "Loading...",
                no_activity: "No activity yet",
                add_friends: "Add friends",
                see_all_activity: "SEE ALL ACTIVITY",
                to_discover: "TO DISCOVER",
                see_more_suggestions: "SEE MORE SUGGESTIONS",
                just_now: "Just now",
                hours_ago: "{{hours}}h ago",
                days_ago: "{{days}}d ago"
            },
            library: {
                total: "Total",
                completed: "Completed",
                progression: "Progress",
                add_work: "ADD A WORK",
                search: "Search...",
                filters: "FILTERS",
                type: "TYPE",
                all: "ALL",
                status: "STATUS",
                sort: {
                    recent: "Recent",
                    added: "Added",
                    alphabetical: "A-Z",
                    progress: "Progress"
                },
                view_grid: "Grid View",
                view_list: "List View",
                export: "Export",
                import: "Import",
                select: "SELECT",
                cancel: "CANCEL",
                delete_selected: "DELETE",
                delete_confirm: "Delete {{count}} works?",
                deleted_success: "{{count}} works deleted",
                deleted_single: "\"{{title}}\" has been deleted",
                data_imported: "Data imported!",
                error: "Error",
                no_works: "No works found",
                delete_title: "DELETE",
                delete_question: "Delete \"{{title}}\"?",
                delete_warning: "This action is irreversible. Your progress and notes will be lost.",
                delete_btn: "DELETE",
                delete_work: "Delete work",
                episode: "Ep.",
                chapter: "Ch."
            },
            changelog: {
                title: "LOGBOOK",
                subtitle: "The history of Bingeki platform updates.",
                updates: "Updates",
                current_version: "Current Version",
                new: "NEW",
                to_be_continued: "TO BE CONTINUED..."
            },
            legal: {
                back: "BACK",
                title: "LEGAL & GDPR",
                section1_title: "1. SITE PUBLISHER",
                name: "Name:",
                address: "Address:",
                contact: "Contact:",
                status: "Status:",
                status_value: "Freelance Developer / Personal Project",
                section2_title: "2. HOSTING",
                hosting_text: "This site is hosted by Firebase (Google LLC).",
                hosting_data: "Some data (images) may be stored via other third-party services.",
                section3_title: "3. INTELLECTUAL PROPERTY",
                ip_design: "The design, structure, and code of \"Bingeki Experience\" are the exclusive property of the publisher.",
                ip_images: "Images of works (manga/anime) are used for illustration purposes and remain the property of their respective rights holders.",
                section4_title: "4. PERSONAL DATA (GDPR)",
                gdpr_intro: "In accordance with the General Data Protection Regulation (GDPR), we inform you that:",
                gdpr_collect_title: "Collection:",
                gdpr_collect: "The data collected (email, profile picture, progress) is only used for the application's operation (library backup, gamification).",
                gdpr_responsible_title: "Responsible:",
                gdpr_responsible: "Moussandou Mroivili is the data controller.",
                gdpr_access_title: "Right of access:",
                gdpr_access: "You have the right to access, rectify, and delete your data. You can delete your account and all associated data directly from the application settings or by contacting us.",
                gdpr_share_title: "Sharing:",
                gdpr_share: "No personal data is sold to third parties.",
                gdpr_cookies_title: "Cookies:",
                gdpr_cookies: "This site only uses technical cookies necessary for authentication (Firebase Auth).",
                section5_title: "5. CONTACT",
                contact_text: "For any questions regarding these legal notices or your data, please contact:"
            },
            credits: {
                title: "CREDITS",
                role: "DEVELOPER & CREATOR",
                description_1: "<strong>Bingeki</strong> was born from a passion for manga and the desire to create a unique user experience.",
                description_2: "Developed with love, coffee, and a lot of CSS. This project is a demonstration of what's possible when you mix brutalist design with modern technologies.",
                made_with: "Made with",
                in_marseille: "in Marseille"
            },
            auth: {
                back: "BACK",
                hero_title: "YOUR<br />ADVENTURE<br />BEGINS",
                hero_subtitle: "Join Bingeki to transform your manga passion into a true RPG quest.",
                feature_rpg: "RPG Tracking",
                feature_progression: "Progression",
                welcome_back: "WELCOME BACK!",
                create_account: "CREATE ACCOUNT",
                resume_progress: "Resume your progress",
                start_legend: "Start your legend",
                placeholder_pseudo: "Username",
                placeholder_email: "Email",
                placeholder_password: "Password",
                login_btn: "LOG IN",
                register_btn: "SIGN UP",
                or: "OR",
                google_login: "CONTINUE WITH GOOGLE",
                no_account: "No account yet? Sign up",
                has_account: "Already have an account? Log in",
                error_pseudo: "Please enter a username",
                error_generic: "An error occurred",
                mobile_title: "YOUR ADVENTURE",
                mobile_subtitle: "Track your manga, earn XP and challenge your friends."
            },
            feedback: {
                success_icon: "💌",
                success_title: "THANK YOU!",
                success_message: "Your feedback has been received. Bingeki improves thanks to you!",
                back_home: "Back to home",
                title: "HELP US IMPROVE",
                subtitle_1: "Found a bug? Got a great idea? Or just want to say hello?",
                subtitle_2: "Your feedback matters a lot for the platform's evolution.",
                rating_label: "Your Overall Rating",
                category_label: "What is this about?",
                category_bug: "A BUG",
                category_idea: "AN IDEA",
                category_general: "GENERAL",
                message_label: "Your Message",
                message_placeholder: "Tell us everything...",
                email_label: "Email (Optional)",
                email_placeholder: "In case we need to contact you...",
                submit_sending: "SENDING...",
                submit_btn: "SEND MY FEEDBACK",
                toast_select_rating: "Please select a rating",
                toast_write_message: "Please write a message",
                toast_success: "Thank you for your feedback!",
                toast_error: "Error sending. Please try again.",
                toast_unexpected: "Unexpected error."
            },
            components: {
                add_work_modal: {
                    title: "RECRUIT A WORK",
                    tab_search: "Search",
                    tab_manual: "Manual",
                    search_placeholder: "Search (e.g. Naruto, Berserk...)",
                    no_results: "No trace detected...",
                    search_hint: "TYPE A NAME TO START THE HUNT",
                    label_title: "TITLE",
                    title_placeholder: "Work title...",
                    label_type: "TYPE",
                    label_chapters: "CHAPTERS",
                    label_episodes: "EPISODES",
                    total_placeholder: "Total...",
                    label_image: "IMAGE (OPTIONAL)",
                    drag_and_drop: "Drag an image or click to upload",
                    or_paste_url: "Or paste a URL below",
                    url_placeholder: "Or image URL...",
                    add_work: "ADD WORK",
                    chapters_abbr: "Chaps",
                    episodes_abbr: "Eps"
                },
                challenges_section: {
                    title: "MY CHALLENGES",
                    types: {
                        race_to_finish: "Race to finish",
                        most_chapters: "Most chapters",
                        streak_battle: "Streak battle"
                    },
                    new_challenge: "NEW CHALLENGE",
                    loading: "Loading...",
                    no_challenges: "No challenges in progress",
                    no_challenges_hint: "Create a challenge and face your friends!",
                    login_required: "Log in to see your challenges",
                    status_active: "Active",
                    status_pending: "Pending",
                    status_completed: "Completed",
                    you: "(You)",
                    days: "days",
                    chapters_abbr: "ch.",
                    accept: "Accept",
                    decline: "Decline",
                    cancel: "Cancel",
                    modal_title: "NEW CHALLENGE",
                    challenge_name: "Challenge name",
                    challenge_name_placeholder: "E.g. Who will finish One Piece first?",
                    challenge_type: "Challenge type",
                    challenge_work: "Challenge work",
                    add_works_hint: "Add works to your library",
                    invite_friends: "Invite friends",
                    selected: "selected",
                    no_friends: "You don't have any friends yet",
                    cancel_btn: "Cancel",
                    create_btn: "Create challenge",
                    toast_fill_fields: "Fill all fields and select friends",
                    toast_created: "Challenge created!",
                    toast_accepted: "Challenge accepted!",
                    toast_declined: "Challenge declined",
                    toast_cancelled: "Challenge cancelled"
                },
                progress_button: {
                    completed: "Completed"
                },
                xp_bar: {
                    level: "LVL"
                }
            },
            challenges: {
                title: "CHALLENGES (Under construction)",
                description: "This page is under development."
            },
            schedule: {
                title: "RELEASE CALENDAR",
                subtitle: "Never miss an episode! Times are based on Japanese broadcast.",
                days: {
                    monday: "Monday",
                    tuesday: "Tuesday",
                    wednesday: "Wednesday",
                    thursday: "Thursday",
                    friday: "Friday",
                    saturday: "Saturday",
                    sunday: "Sunday"
                },
                unknown_time: "Unknown time",
                no_anime: "No anime found for this day... It's quiet! 🍃"
            },
            admin: {
                sidebar: {
                    admin_panel: "ADMIN PANEL",
                    dashboard: "Dashboard",
                    users: "Users",
                    feedback: "Feedback",
                    system: "System",
                    back_to_site: "Back to site",
                    exit: "Exit"
                },
                dashboard: {
                    loading: "Loading dashboard...",
                    title: "Control Center",
                    subtitle: "Overview of activity on Bingeki",
                    users_label: "Users",
                    today: "today",
                    feedback_label: "Feedback",
                    tickets_pending: "tickets pending",
                    system_label: "System",
                    activity_volume: "Activity Volume",
                    last_7_days: "LAST 7 DAYS",
                    recent_members: "Recent Members",
                    anonymous: "Anonymous",
                    quick_actions: "Quick Actions",
                    manage_users: "Manage Users",
                    view_feedback: "View Feedback",
                    live_console: "Live Console"
                },
                users: {
                    title: "User Management",
                    members_count: "{{count}} registered members",
                    search_placeholder: "Search (Email, Username...)",
                    loading: "Loading...",
                    no_name: "No name",
                    ban: "Ban",
                    admin: "Admin",
                    view_profile: "View Profile",
                    ban_yes: "YES",
                    ban_no: "NO",
                    confirm_ban: "Do you really want to {{action}} this user?",
                    confirm_admin: "WARNING: {{action}} administrator rights?",
                    update_error: "Error during update",
                    action_ban: "ban",
                    action_unban: "unban",
                    action_give: "Give",
                    action_remove: "Remove"
                },
                feedback: {
                    title: "Feedback Center",
                    tickets_pending: "{{count}} tickets pending",
                    refresh: "Refresh",
                    loading: "Loading messages...",
                    no_messages: "No messages at the moment.",
                    anonymous: "Anonymous",
                    resolved: "Resolved",
                    reply: "Reply",
                    no_email: "No email",
                    reopen: "Reopen",
                    mark_resolved: "Mark as resolved",
                    delete: "Delete",
                    confirm_delete: "Delete this feedback permanently?",
                    delete_error: "Error during deletion",
                    status_error: "Error updating status"
                },
                system: {
                    title: "System & Logs",
                    subtitle: "Real-time monitoring and global configuration",
                    global_announcement: "Global Announcement",
                    message_placeholder: "Message for all users...",
                    info: "INFO",
                    alert: "ALERT",
                    enable_announcement: "Enable announcement",
                    update_live: "Update (LIVE)",
                    save_offline: "Save (Offline)",
                    server_config: "Server Configuration",
                    maintenance_mode: "Maintenance Mode",
                    maintenance_desc: "Blocks access except for admins",
                    registrations: "Registrations",
                    registrations_desc: "Allow new members",
                    database: "Database",
                    data_shield: "Data Shield Protocol v3.0 Active",
                    manual_backup: "Start Manual Backup",
                    live: "LIVE"
                },
                work_details: {
                    back: "BACK",
                    loading: "LOADING...",
                    not_found: "WORK NOT FOUND",
                    not_found_desc: "Unable to retrieve details. Check your connection or the ID.",
                    tabs: {
                        general: "GENERAL",
                        chapters_list: "CHAPTERS LIST",
                        episodes_list: "EPISODES LIST",
                        music: "MUSIC",
                        reviews: "REVIEWS",
                        gallery: "GALLERY",
                        stats: "STATISTICS"
                    },
                    meta: {
                        score: "Score",
                        chaps: "Chaps",
                        eps: "Eps"
                    },
                    streaming: {
                        watch_on: "Watch on",
                        watch: "WATCH",
                        read: "READ",
                        search_episode: "Google Search - Episode",
                        search_chapter: "Read - Chapter"
                    },
                    synopsis: {
                        title: "SYNOPSIS",
                        show_less: "Less",
                        show_more: "Read more"
                    },
                    info: {
                        season: "SEASON",
                        studio: "STUDIO",
                        rank: "RANK",
                        popularity: "POPULARITY"
                    },
                    trailer: {
                        title: "TRAILER",
                        watch: "WATCH TRAILER",
                        close: "CLOSE"
                    },
                    casting: {
                        title: "CASTING",
                        show_more: "SEE MORE",
                        show_less: "SEE LESS"
                    },
                    universe: {
                        title: "EXTENDED UNIVERSE",
                        collapse: "Collapse",
                        expand: "See {{count}} more"
                    },
                    library: {
                        interested: "INTERESTED?",
                        add_desc: "Add this work to your library to track your progress!",
                        add_to_collection: "ADD TO MY COLLECTION",
                        login_to_add: "LOG IN TO ADD",
                        added_toast: "Added to your library!"
                    },
                    progress: {
                        title: "PROGRESS",
                        edit: "Edit",
                        saved_toast: "Progress saved!"
                    },
                    status: {
                        title: "STATUS"
                    },
                    rating: {
                        title: "MY RATING"
                    },
                    notes: {
                        title: "MY NOTES",
                        placeholder: "Write your thoughts here..."
                    },
                    comments: {
                        title: "COMMENTS",
                        time_now: "Just now",
                        time_hours: "{{hours}}h ago",
                        time_days: "{{days}}d ago",
                        reply: "REPLY",
                        reply_to: "Reply to {{name}}...",
                        spoiler: "SPOILER",
                        friends_reading: "{{count}} friend(s) {{action}} this work too",
                        friends_watching: "is watching",
                        friends_reading_action: "is reading",
                        share_opinion: "Share your opinion...",
                        contains_spoilers: "Contains spoilers",
                        publish: "PUBLISH",
                        login_to_comment: "Log in to comment",
                        loading: "Loading comments...",
                        no_comments: "No comments. Be the first!",
                        error_loading: "Loading error:",
                        permission_error: "You do not have permission to view comments (Firestore Rules).",
                        generic_error: "Unable to load comments.",
                        added_toast: "Comment added!",
                        error_toast: "Error adding comment",
                        reply_added_toast: "Reply added!",
                        reply_error_toast: "Error adding reply",
                        show_less: "▲ Collapse",
                        show_more: "▼ See {{count}} more",
                        reading: "You and {{count}} friend(s) are also reading this work",
                        watching: "You and {{count}} friend(s) are also watching this work",
                        placeholder: "Share your opinion (no spoilers please)...",
                        submit: "SUBMIT"
                    },
                    danger: {
                        delete: "Remove from library",
                        deleted_toast: "\"{{title}}\" has been removed"
                    },
                    delete_modal: {
                        title: "DELETION",
                        confirm: "Delete \"{{title}}\"?",
                        warning: "This action is irreversible. Your progress and notes will be lost.",
                        cancel: "CANCEL",
                        delete: "DELETE"
                    },
                    stats_tab: {
                        no_data: "No statistics or staff information available for this work.",
                        staff_title: "STAFF (MAIN)",
                        statistics_title: "STATISTICS",
                        in_libraries: "IN LIBRARIES",
                        status_watching: "Watching",
                        status_completed: "Completed",
                        status_on_hold: "On Hold",
                        status_dropped: "Dropped",
                        status_plan_to_watch: "Plan to Watch",
                        members_scores: "MEMBER SCORES"
                    },
                    reviews_tab: {
                        title: "COMMUNITY REVIEWS (MyAnimeList)",
                        read_full: "READ FULL REVIEW",
                        no_reviews: "NO REVIEWS FOUND",
                        no_reviews_desc: "Be the first to give your opinion in the comments section below!"
                    },
                    gallery_tab: {
                        title: "OFFICIAL GALLERY",
                        no_images: "No images available."
                    },
                    themes_tab: {
                        title: "SOUNDTRACKS",
                        openings: "OPENINGS",
                        endings: "ENDINGS",
                        no_opening: "No opening found.",
                        no_ending: "No ending found.",
                        no_music: "No music (opening/ending) available."
                    },
                    recommendations: {
                        title: "YOU MIGHT ALSO LIKE",
                        votes: "VOTES"
                    },
                    chapters: {
                        unknown_count: "UNKNOWN CHAPTER COUNT",
                        unknown_desc: "Please set the total number of chapters in the \"General\" tab to generate the list.",
                        set_count: "Set chapter count",
                        prompt: "Enter total number of chapters:",
                        prompt_total: "Enter total number:",
                        click_to_edit: "Click to edit total"
                    }
                },
                character_details: {
                    back: "BACK",
                    not_found: "Character not found.",
                    favorites: "favorites",
                    identity: "IDENTITY",
                    biography: "BIOGRAPHY",
                    source: "Source",
                    seiyuu: "SEIYUU (JP VOICE ACTORS)",
                    anime_appearances: "ANIME APPEARANCES",
                    manga_appearances: "MANGA APPEARANCES"
                }
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
