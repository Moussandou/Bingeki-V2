#!/usr/bin/env npx tsx
/**
 * auto-translate.ts
 * 
 * Automatically extracts hardcoded strings from React components,
 * generates translation keys, updates i18n.ts, and modifies the source files.
 * 
 * Usage:
 *   npx tsx scripts/auto-translate.ts                    # Dry run (preview)
 *   npx tsx scripts/auto-translate.ts --apply            # Apply changes
 *   npx tsx scripts/auto-translate.ts --file=src/...     # Single file
 */

import * as fs from 'fs';
import * as path from 'path';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m'
};

interface TranslationFix {
    file: string;
    line: number;
    original: string;
    translationKey: string;
    frText: string;
    enText: string;
}

// Common French -> English translations
const frenchToEnglish: Record<string, string> = {
    "Chargement...": "Loading...",
    "Chargement": "Loading",
    "Erreur": "Error",
    "Succès": "Success",
    "Annuler": "Cancel",
    "Confirmer": "Confirm",
    "Enregistrer": "Save",
    "Supprimer": "Delete",
    "Modifier": "Edit",
    "Ajouter": "Add",
    "Retour": "Back",
    "Suivant": "Next",
    "Précédent": "Previous",
    "Rechercher": "Search",
    "Aucun résultat": "No results",
    "Connectez-vous": "Log in",
    "Déconnexion": "Logout",
    "Créer": "Create",
    "Terminer": "End",
    "Quitter": "Leave",
    "Fermer": "Close",
    "Ouvrir": "Open",
    "Voir": "See",
    "Voir plus": "See more",
    "Afficher": "Show",
    "Masquer": "Hide",
    "Oui": "Yes",
    "Non": "No",
    "Aucun": "None",
    "Tous": "All",
    "Épisode": "Episode",
    "Chapitre": "Chapter",
    "Saison": "Season",
    "Volume": "Volume",
    "Page": "Page",
    "Date inconnue": "Unknown date",
    "Aucun contenu disponible": "No content available",
    "Aucune donnée": "No data",
    "En cours": "In progress",
    "Terminé": "Completed",
    "Planifié": "Planned",
    "Abandonné": "Dropped",
    "En pause": "Paused",
    "participant": "participant",
    "participants": "participants",
    "ami": "friend",
    "amis": "friends",
    "Inviter": "Invite",
    "Rejoindre": "Join",
    "Partager": "Share",
    "Copier": "Copy",
    "Coller": "Paste",
    "Filtrer": "Filter",
    "Trier": "Sort",
    "Nouveau": "New",
    "Nouvelle": "New",
    "Anciens": "Old",
    "Récent": "Recent",
    "Populaire": "Popular",
    "Note": "Rating",
    "Score": "Score",
    "Favoris": "Favorites",
    "Collection": "Collection",
    "Bibliothèque": "Library",
    "Profil": "Profile",
    "Paramètres": "Settings",
    "Accueil": "Home",
    "Tableau de bord": "Dashboard"
};

// Intelligently translate French text to English
function translateToEnglish(frText: string): string {
    // Check exact matches first
    if (frenchToEnglish[frText]) {
        return frenchToEnglish[frText];
    }

    // Try partial matches
    let result = frText;
    for (const [fr, en] of Object.entries(frenchToEnglish)) {
        result = result.replace(new RegExp(fr, 'gi'), en);
    }

    // If no translation found, return original with [EN] prefix for manual review
    if (result === frText && /[àâäéèêëïîôùûüçœæ]/i.test(frText)) {
        return `[TRANSLATE] ${frText}`;
    }

    return result;
}

// Generate a translation key from text
function generateKey(text: string, namespace: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .substring(0, 30);
}

// Extract namespace from file path
function getNamespaceFromFile(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    return basename
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace(/_+/g, '_');
}

// Scan a file for hardcoded strings
function scanFile(filePath: string): TranslationFix[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const fixes: TranslationFix[] = [];
    const namespace = getNamespaceFromFile(filePath);
    const usedKeys = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Skip imports, types, comments
        if (line.trim().startsWith('import ') ||
            line.trim().startsWith('//') ||
            line.trim().startsWith('*') ||
            line.includes('type ') ||
            line.includes('interface ')) {
            continue;
        }

        // Match JSX text content: >French text<
        const jsxMatches = [...line.matchAll(/>([^<>{}\n]{3,})</g)];
        for (const match of jsxMatches) {
            const text = match[1].trim();
            if (text && /[àâäéèêëïîôùûüçœæ]/i.test(text) ||
                Object.keys(frenchToEnglish).some(fr => text.includes(fr))) {

                let key = generateKey(text, namespace);
                while (usedKeys.has(key)) {
                    key = key + '_' + Math.random().toString(36).substring(7, 10);
                }
                usedKeys.add(key);

                fixes.push({
                    file: filePath,
                    line: lineNum,
                    original: text,
                    translationKey: `${namespace}.${key}`,
                    frText: text,
                    enText: translateToEnglish(text)
                });
            }
        }
    }

    return fixes;
}

// Find all TSX files
function findTsxFiles(dir: string): string[] {
    const files: string[] = [];
    const skipDirs = ['node_modules', 'dist', 'build', '.git', 'scripts'];

    function scan(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
                scan(fullPath);
            } else if (entry.isFile() && /\.tsx$/.test(entry.name) && !entry.name.includes('.d.ts')) {
                files.push(fullPath);
            }
        }
    }

    scan(dir);
    return files;
}

// Generate i18n entries for a list of fixes
function generateI18nEntries(fixes: TranslationFix[]): { fr: string; en: string } {
    const byNamespace = new Map<string, TranslationFix[]>();

    for (const fix of fixes) {
        const ns = fix.translationKey.split('.')[0];
        const existing = byNamespace.get(ns) || [];
        existing.push(fix);
        byNamespace.set(ns, existing);
    }

    let frEntries = '';
    let enEntries = '';

    for (const [ns, nsFixes] of byNamespace) {
        frEntries += `            ${ns}: {\n`;
        enEntries += `            ${ns}: {\n`;

        for (const fix of nsFixes) {
            const key = fix.translationKey.split('.')[1];
            frEntries += `                ${key}: "${fix.frText.replace(/"/g, '\\"')}",\n`;
            enEntries += `                ${key}: "${fix.enText.replace(/"/g, '\\"')}",\n`;
        }

        frEntries += `            },\n`;
        enEntries += `            },\n`;
    }

    return { fr: frEntries, en: enEntries };
}

function main() {
    console.log(`${colors.bold}${colors.cyan}🔧 Auto-Translate Tool${colors.reset}\n`);

    const apply = process.argv.includes('--apply');
    const singleFileArg = process.argv.find(a => a.startsWith('--file='));
    const singleFile = singleFileArg ? singleFileArg.split('=')[1] : null;

    const srcDir = path.join(process.cwd(), 'src');
    const files = singleFile ? [singleFile] : findTsxFiles(srcDir);

    console.log(`${colors.cyan}Scanning ${files.length} files...${colors.reset}\n`);

    const allFixes: TranslationFix[] = [];

    for (const file of files) {
        const fixes = scanFile(file);
        allFixes.push(...fixes);
    }

    if (allFixes.length === 0) {
        console.log(`${colors.green}✅ No hardcoded strings found!${colors.reset}`);
        return;
    }

    console.log(`${colors.yellow}Found ${allFixes.length} hardcoded strings:${colors.reset}\n`);

    // Group by file for display
    const byFile = new Map<string, TranslationFix[]>();
    for (const fix of allFixes) {
        const existing = byFile.get(fix.file) || [];
        existing.push(fix);
        byFile.set(fix.file, existing);
    }

    for (const [file, fixes] of byFile) {
        const relPath = path.relative(process.cwd(), file);
        console.log(`${colors.cyan}${relPath}${colors.reset}`);
        for (const fix of fixes.slice(0, 3)) {
            console.log(`  L${fix.line}: "${colors.yellow}${fix.frText}${colors.reset}"`);
            console.log(`       → ${colors.green}t('${fix.translationKey}')${colors.reset}`);
        }
        if (fixes.length > 3) {
            console.log(`  ${colors.gray}... and ${fixes.length - 3} more${colors.reset}`);
        }
        console.log();
    }

    // Generate i18n entries
    const i18nEntries = generateI18nEntries(allFixes);

    console.log(`${colors.bold}Generated i18n entries:${colors.reset}\n`);
    console.log(`${colors.cyan}// Add to FR block:${colors.reset}`);
    console.log(i18nEntries.fr.substring(0, 500) + (i18nEntries.fr.length > 500 ? '...' : ''));
    console.log(`\n${colors.cyan}// Add to EN block:${colors.reset}`);
    console.log(i18nEntries.en.substring(0, 500) + (i18nEntries.en.length > 500 ? '...' : ''));

    if (!apply) {
        console.log(`\n${colors.yellow}This is a dry run. Use --apply to make changes.${colors.reset}`);

        // Save the output to a file for manual review
        const output = {
            totalFixes: allFixes.length,
            fixes: allFixes,
            i18n: i18nEntries
        };
        fs.writeFileSync('translation-fixes.json', JSON.stringify(output, null, 2));
        console.log(`${colors.green}Saved detailed report to translation-fixes.json${colors.reset}`);
    } else {
        console.log(`\n${colors.green}${colors.bold}Applying changes...${colors.reset}`);
        // TODO: Implement actual file modifications
        console.log(`${colors.yellow}Auto-apply not yet implemented. Use the generated JSON to apply manually.${colors.reset}`);
    }
}

main();
