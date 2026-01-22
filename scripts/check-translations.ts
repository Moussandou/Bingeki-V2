#!/usr/bin/env npx tsx
/**
 * check-translations.ts
 * 
 * Checks for missing translation keys between French and English locales.
 * Also scans the codebase for translation key usage.
 * 
 * Usage:
 *   npx tsx scripts/check-translations.ts
 *   npx tsx scripts/check-translations.ts --check-unused
 */

import * as fs from 'fs';
import * as path from 'path';

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Read i18n.ts and extract the resources object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResources(): { fr: Record<string, any>, en: Record<string, any> } {
    const i18nPath = path.join(process.cwd(), 'src', 'i18n.ts');
    const content = fs.readFileSync(i18nPath, 'utf-8');

    // Extract the resources object using regex
    const resourcesMatch = content.match(/const resources\s*=\s*(\{[\s\S]*?\n\};)/);
    if (!resourcesMatch) {
        throw new Error('Could not find resources object in i18n.ts');
    }


    // Use a different approach - import the actual file
    try {
        // Dynamic import workaround - read and eval
        const evalContent = content
            .replace(/import.*from.*['"].*['"];?\n?/g, '')
            .replace(/export default.*/, '')
            .replace(/i18n\s*\.use[\s\S]*/, '');

        const fn = new Function(`
            ${evalContent}
            return resources;
        `);
        return fn();
    } catch (e) {
        console.error('Failed to parse resources:', e);
        throw e;
    }
}

// Recursively get all keys from an object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

// Scan source files for t('...') calls
function findUsedTranslationKeys(): Set<string> {
    const usedKeys = new Set<string>();
    const srcDir = path.join(process.cwd(), 'src');

    function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                scanDir(fullPath);
            } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
                const content = fs.readFileSync(fullPath, 'utf-8');

                // Match t('key') or t("key") patterns
                const matches = content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g);
                for (const match of matches) {
                    usedKeys.add(match[1]);
                }
            }
        }
    }

    scanDir(srcDir);
    return usedKeys;
}

// Main function
function main() {
    console.log(`${colors.bold}${colors.cyan}🔍 Translation Key Checker${colors.reset}\n`);

    const checkUnused = process.argv.includes('--check-unused');

    try {
        const resources = extractResources();

        const frKeys = new Set(getAllKeys(resources.fr.translation));
        const enKeys = new Set(getAllKeys(resources.en.translation));

        console.log(`${colors.cyan}Found:${colors.reset}`);
        console.log(`  • French keys: ${frKeys.size}`);
        console.log(`  • English keys: ${enKeys.size}\n`);

        // Find missing in English
        const missingInEn: string[] = [];
        for (const key of frKeys) {
            if (!enKeys.has(key)) {
                missingInEn.push(key);
            }
        }

        // Find missing in French
        const missingInFr: string[] = [];
        for (const key of enKeys) {
            if (!frKeys.has(key)) {
                missingInFr.push(key);
            }
        }

        // Report missing keys
        if (missingInEn.length > 0) {
            console.log(`${colors.red}${colors.bold}❌ Missing in English (${missingInEn.length}):${colors.reset}`);
            for (const key of missingInEn.slice(0, 20)) {
                console.log(`   ${colors.red}• ${key}${colors.reset}`);
            }
            if (missingInEn.length > 20) {
                console.log(`   ${colors.yellow}... and ${missingInEn.length - 20} more${colors.reset}`);
            }
            console.log();
        }

        if (missingInFr.length > 0) {
            console.log(`${colors.red}${colors.bold}❌ Missing in French (${missingInFr.length}):${colors.reset}`);
            for (const key of missingInFr.slice(0, 20)) {
                console.log(`   ${colors.red}• ${key}${colors.reset}`);
            }
            if (missingInFr.length > 20) {
                console.log(`   ${colors.yellow}... and ${missingInFr.length - 20} more${colors.reset}`);
            }
            console.log();
        }

        // Check for unused keys
        if (checkUnused) {
            console.log(`${colors.cyan}Scanning codebase for unused keys...${colors.reset}\n`);

            const usedKeys = findUsedTranslationKeys();
            const allDefinedKeys = new Set([...frKeys, ...enKeys]);

            const unusedKeys: string[] = [];
            for (const key of allDefinedKeys) {
                if (!usedKeys.has(key)) {
                    unusedKeys.push(key);
                }
            }

            if (unusedKeys.length > 0) {
                console.log(`${colors.yellow}${colors.bold}⚠️  Potentially unused keys (${unusedKeys.length}):${colors.reset}`);
                for (const key of unusedKeys.slice(0, 15)) {
                    console.log(`   ${colors.yellow}• ${key}${colors.reset}`);
                }
                if (unusedKeys.length > 15) {
                    console.log(`   ${colors.yellow}... and ${unusedKeys.length - 15} more${colors.reset}`);
                }
                console.log();
            }
        }

        // Summary
        if (missingInEn.length === 0 && missingInFr.length === 0) {
            console.log(`${colors.green}${colors.bold}✅ All translations are in sync!${colors.reset}`);
        } else {
            console.log(`${colors.yellow}${colors.bold}⚠️  Total missing: ${missingInEn.length + missingInFr.length} keys${colors.reset}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`${colors.red}Error: ${error}${colors.reset}`);
        process.exit(1);
    }
}

main();
