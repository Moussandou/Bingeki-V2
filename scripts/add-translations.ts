#!/usr/bin/env npx tsx
/**
 * add-translations.ts
 * 
 * Automatically adds new translation keys to JSON files in public/locales/.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

interface TranslationEntry {
    namespace: string;
    key: string;
    fr: string;
    en: string;
}

function parseArgs(): Partial<TranslationEntry> {
    const args: Partial<TranslationEntry> = {};
    for (const arg of process.argv.slice(2)) {
        const match = arg.match(/^--(\w+)=(.+)$/);
        if (match) {
            const [, key, value] = match;
            if (key === 'ns' || key === 'namespace') args.namespace = value;
            else if (key === 'key') args.key = value;
            else if (key === 'fr') args.fr = value;
            else if (key === 'en') args.en = value;
        }
    }
    return args;
}

async function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function setNestedKey(obj: Record<string, unknown>, keyPath: string, value: unknown) {
    const keys = keyPath.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

function updateJsonFile(lng: string, ns: string, key: string, value: string) {
    const filePath = path.join(LOCALES_DIR, lng, `${ns}.json`);
    const dirPath = path.dirname(filePath);
    
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    setNestedKey(data, key, value);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
    console.log(`${colors.cyan}${colors.bold}📝 Add Translation (JSON Mode)${colors.reset}\n`);

    const partial = parseArgs();
    
    const namespace = partial.namespace || await prompt(`${colors.cyan}Namespace${colors.reset} (default: translation): `) || 'translation';
    const key = partial.key || await prompt(`${colors.cyan}Key${colors.reset} (e.g. settings.title): `);
    const fr = partial.fr || await prompt(`${colors.cyan}French text${colors.reset}: `);
    const en = partial.en || await prompt(`${colors.cyan}English text${colors.reset}: `);

    updateJsonFile('fr', namespace, key, fr);
    updateJsonFile('en', namespace, key, en);

    console.log(`\n${colors.green}${colors.bold}✅ Added to ${namespace}.json:${colors.reset}`);
    console.log(`  FR: ${key} -> "${fr}"`);
    console.log(`  EN: ${key} -> "${en}"`);
}

main().catch(console.error);
