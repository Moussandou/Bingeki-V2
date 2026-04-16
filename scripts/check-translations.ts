#!/usr/bin/env npx tsx
/**
 * check-translations.ts
 * 
 * Checks for missing translation keys between French and English locales.
 * Supports multiple namespaces in public/locales/{{lng}}/{{ns}}.json.
 */

import * as fs from 'fs';
import * as path from 'path';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');
const SRC_DIR = path.join(process.cwd(), 'src');

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function loadLocales(lng: string): Record<string, Set<string>> {
    const lngDir = path.join(LOCALES_DIR, lng);
    const result: Record<string, Set<string>> = {};

    if (!fs.existsSync(lngDir)) return result;

    const files = fs.readdirSync(lngDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
        const ns = path.basename(file, '.json');
        const content = JSON.parse(fs.readFileSync(path.join(lngDir, file), 'utf-8'));
        result[ns] = new Set(getAllKeys(content));
    }
    return result;
}

function findUsedTranslationKeys(): Set<string> {
    const usedKeys = new Set<string>();
    function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                scanDir(fullPath);
            } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const matches = content.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g);
                for (const match of matches) {
                    usedKeys.add(match[1]);
                }
            }
        }
    }
    scanDir(SRC_DIR);
    return usedKeys;
}

function main() {
    console.log(`${colors.bold}${colors.cyan}🔍 Translation Key Checker (Namespaces Mode)${colors.reset}\n`);

    const frLocales = loadLocales('fr');
    const enLocales = loadLocales('en');
    const namespaces = Object.keys(frLocales);

    if (namespaces.length === 0) {
        console.error(`${colors.red}No namespaces found in ${LOCALES_DIR}/fr${colors.reset}`);
        process.exit(1);
    }

    let hasErrors = false;

    // 1. Cross-language check
    for (const ns of namespaces) {
        console.log(`${colors.bold}${colors.cyan}Namespace: ${ns}${colors.reset}`);
        const frKeys = frLocales[ns];
        const enKeys = enLocales[ns] || new Set();

        const missingInEn = [...frKeys].filter(k => !enKeys.has(k));
        const missingInFr = [...enKeys].filter(k => !frKeys.has(k));

        if (missingInEn.length > 0) {
            console.log(`  ${colors.red}❌ Missing in English (${missingInEn.length}):${colors.reset}`);
            missingInEn.slice(0, 10).forEach(k => console.log(`     • ${k}`));
            hasErrors = true;
        }
        if (missingInFr.length > 0) {
            console.log(`  ${colors.red}❌ Missing in French (${missingInFr.length}):${colors.reset}`);
            missingInFr.slice(0, 10).forEach(k => console.log(`     • ${k}`));
            hasErrors = true;
        }
        if (missingInEn.length === 0 && missingInFr.length === 0) {
            console.log(`  ${colors.green}✅ In sync (${frKeys.size} keys)${colors.reset}`);
        }
        console.log();
    }

    // 2. Code usage check
    console.log(`${colors.bold}${colors.cyan}Verifying code usage...${colors.reset}`);
    const usedKeys = findUsedTranslationKeys();
    const allDefinedKeys = new Set<string>();
    
    // Build a map of all defined keys across all namespaces
    for (const [ns, keys] of Object.entries(frLocales)) {
        for (const key of keys) {
            // Support both 'ns:key' and just 'key' (due to global fallbackNS)
            allDefinedKeys.add(`${ns}:${key}`);
            allDefinedKeys.add(key);
        }
    }

    const missingDefinitions: string[] = [];
    for (const key of usedKeys) {
        if (key.includes('${')) continue; // Skip dynamic keys
        if (!allDefinedKeys.has(key)) {
            missingDefinitions.push(key);
        }
    }

    if (missingDefinitions.length > 0) {
        console.log(`${colors.red}❌ Used in code but missing in JSON (${missingDefinitions.length}):${colors.reset}`);
        missingDefinitions.slice(0, 20).forEach(k => console.log(`   • ${k}`));
        hasErrors = true;
    } else {
        console.log(`${colors.green}✅ All used keys are defined!${colors.reset}`);
    }

    console.log('\n' + (hasErrors ? `${colors.red}⚠️  Issues found.` : `${colors.green}🎉 All good!`));
    process.exit(hasErrors ? 1 : 0);
}

main();
