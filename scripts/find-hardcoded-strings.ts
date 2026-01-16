#!/usr/bin/env npx tsx
/**
 * find-hardcoded-strings.ts
 * 
 * Scans React components for potentially hardcoded French/English strings
 * that should be using the translation system.
 * 
 * Usage:
 *   npx tsx scripts/find-hardcoded-strings.ts
 *   npx tsx scripts/find-hardcoded-strings.ts --strict  # Fail on warnings
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

interface Finding {
    file: string;
    line: number;
    text: string;
    context: string;
}

// Common French words to detect
const frenchPatterns = [
    /\b(Bonjour|Bienvenue|Connexion|Déconnexion|Inscription|Profil|Paramètres)\b/i,
    /\b(Modifier|Supprimer|Ajouter|Annuler|Enregistrer|Retour|Suivant)\b/i,
    /\b(Chargement|Erreur|Succès|Attention|Confirmer)\b/i,
    /\b(Chapitre|Épisode|Manga|Anime|Série)\b/i,
    /\b(Favoris|Collection|Bibliothèque|Découvrir)\b/i,
    /\b(Aujourd'hui|Hier|Demain|Semaine|Mois)\b/i,
    /\b(Rechercher|Filtrer|Trier|Afficher)\b/i,
];

// Common English words that suggest hardcoded text
const englishPatterns = [
    /\b(Loading|Error|Success|Warning|Confirm)\b/,
    /\b(Submit|Cancel|Save|Delete|Edit|Add|Remove)\b/,
    /\b(Welcome|Hello|Goodbye|Login|Logout|Sign up|Sign in)\b/,
    /\b(Profile|Settings|Dashboard|Home|Back|Next|Previous)\b/,
    /\b(Search|Filter|Sort|Show|Hide)\b/,
];

// Patterns to ignore (technical, not user-facing)
const ignorePatterns = [
    /^[a-z_]+$/,  // snake_case (likely keys)
    /^[A-Z_]+$/,  // SCREAMING_SNAKE_CASE (constants)
    /^https?:\/\//,  // URLs
    /^#[0-9a-fA-F]+$/,  // Hex colors
    /^\d+(\.\d+)?$/,  // Numbers
    /^[a-zA-Z]+\.[a-zA-Z]+/,  // Object paths
    /className/,
    /console\./,
    /import /,
    /export /,
    /\.module\.css/,
    /\/\*/,  // Comments
    /\/\//,  // Comments
    // Non-translatable content
    /^\+\d+ XP$/,  // XP gains like "+10 XP"
    /^[A-Z]+ Logo$/i,  // Logo alt texts
    /^0 &&$/,  // Code snippets
    /^(JJK|AOT|Naruto)$/,  // Anime abbreviations
    /^Created by$/,  // Generic labels
];

// Strings to explicitly ignore
const ignoreStrings = [
    'Bingeki Logo',
    'Full Screen Trailer',
    'Gallery Fullscreen',
    'BASIC INFO',
    'Display Name:',
    'Edit User Stats',
    'User Details',
    'Save Changes',
    // Alt/title attributes (accessibility, not translated)
    'Accès refusé',   // Already in common translations
    'Chargement',     // Already in common translations
];

// Files/folders to skip
const skipPaths = [
    'node_modules',
    'dist',
    'build',
    '.git',
    'scripts',
    'i18n.ts',  // The translation file itself
    '.d.ts',
    // Blacklisted files (internal/presentation pages)
    'AssetsPage.tsx',
    'DeveloperLicenseCard.tsx',
    // Files with brand names, addresses, proper nouns (no translation needed)
    'Credits.tsx',      // Library names: FRAMER MOTION, LUCIDE, etc.
    'Legal.tsx',        // Legal info: names, addresses
    'Footer.tsx',       // Location: Marseille, France
    'Opening.tsx',      // Stylized text, brand elements
    'NenChart.tsx',     // Technical chart labels
    // Admin pages (internal use, low priority)
    'admin/',           // All admin pages
    // Tier list pages (mostly English, gaming terms)
    'tierlist/',        // All tier list pages
];

function shouldSkip(filePath: string): boolean {
    return skipPaths.some(skip => filePath.includes(skip));
}

function extractJSXTextContent(content: string): Array<{ line: number; text: string; context: string }> {
    const findings: Array<{ line: number; text: string; context: string }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Skip imports, comments, and type definitions
        if (line.trim().startsWith('import ') ||
            line.trim().startsWith('//') ||
            line.trim().startsWith('*') ||
            line.trim().startsWith('/*') ||
            line.includes('type ') ||
            line.includes('interface ')) {
            continue;
        }

        // Look for text in JSX: >text< or >text</
        const jsxTextMatches = line.matchAll(/>\s*([^<>{}\n]+?)\s*<\/?/g);
        for (const match of jsxTextMatches) {
            const text = match[1].trim();
            if (text.length > 2 &&
                !ignorePatterns.some(p => p.test(text)) &&
                !ignoreStrings.some(s => text.includes(s))) {
                // Check if it looks like French or English text
                const isFrench = frenchPatterns.some(p => p.test(text));
                const isEnglish = englishPatterns.some(p => p.test(text));
                const hasMultipleWords = text.split(/\s+/).length >= 2;

                if (isFrench || isEnglish || hasMultipleWords) {
                    findings.push({
                        line: lineNum,
                        text,
                        context: line.trim().substring(0, 100)
                    });
                }
            }
        }

        // Note: alt/title attributes are accessibility features
        // They could be translated but are lower priority
        // Uncomment below to detect them:
        /*
        // Look for hardcoded strings in placeholders, titles, etc.
        const attrMatches = line.matchAll(/(placeholder|title|label|alt|aria-label)=["']([^"']+)["']/gi);
        for (const match of attrMatches) {
            const text = match[2].trim();
            if (text.length > 2 && !text.includes('{') && !text.startsWith('t(')) {
                const isFrench = frenchPatterns.some(p => p.test(text));
                const isEnglish = englishPatterns.some(p => p.test(text));
        
                if (isFrench || isEnglish || text.split(/\s+/).length >= 2) {
                    findings.push({
                        line: lineNum,
                            text: `[${match[1]}] ${text}`,
                            context: line.trim().substring(0, 100)
                        });
                    }
                }
                */
    }

    return findings;
}

function scanDirectory(dir: string): Finding[] {
    const allFindings: Finding[] = [];

    function scan(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (shouldSkip(fullPath)) continue;

            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (/\.(tsx|jsx)$/.test(entry.name)) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const findings = extractJSXTextContent(content);

                for (const finding of findings) {
                    allFindings.push({
                        file: path.relative(process.cwd(), fullPath),
                        ...finding
                    });
                }
            }
        }
    }

    scan(dir);
    return allFindings;
}

function main() {
    console.log(`${colors.bold}${colors.cyan}🔍 Hardcoded String Detector${colors.reset}\n`);

    const strict = process.argv.includes('--strict');
    const srcDir = path.join(process.cwd(), 'src');

    console.log(`${colors.cyan}Scanning src/ for potentially hardcoded strings...${colors.reset}\n`);

    const findings = scanDirectory(srcDir);

    if (findings.length === 0) {
        console.log(`${colors.green}${colors.bold}✅ No hardcoded strings detected!${colors.reset}`);
        return;
    }

    // Group by file
    const byFile = new Map<string, Finding[]>();
    for (const finding of findings) {
        const existing = byFile.get(finding.file) || [];
        existing.push(finding);
        byFile.set(finding.file, existing);
    }

    console.log(`${colors.yellow}${colors.bold}⚠️  Found ${findings.length} potential hardcoded strings in ${byFile.size} files:${colors.reset}\n`);

    for (const [file, fileFindings] of byFile) {
        console.log(`${colors.cyan}${file}${colors.reset}`);
        for (const finding of fileFindings.slice(0, 5)) {
            console.log(`  ${colors.gray}L${finding.line}:${colors.reset} "${colors.yellow}${finding.text}${colors.reset}"`);
        }
        if (fileFindings.length > 5) {
            console.log(`  ${colors.gray}... and ${fileFindings.length - 5} more${colors.reset}`);
        }
        console.log();
    }

    console.log(`${colors.bold}Tip:${colors.reset} Replace hardcoded text with t('namespace.key') calls.`);
    console.log(`${colors.gray}Run with --strict to fail CI on warnings.${colors.reset}\n`);

    if (strict) {
        console.log(`${colors.red}${colors.bold}❌ Strict mode: Failing due to hardcoded strings.${colors.reset}`);
        process.exit(1);
    }
}

main();
