#!/usr/bin/env npx tsx
/**
 * add-translations.ts
 * 
 * Automatically adds new translation keys to i18n.ts for both FR and EN.
 * 
 * Usage:
 *   npx tsx scripts/add-translations.ts --ns="profile" --key="new_key" --fr="Texte" --en="Text"
 *   
 * Or interactive mode:
 *   npx tsx scripts/add-translations.ts
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
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function getTranslationEntry(partial: Partial<TranslationEntry>): Promise<TranslationEntry> {
    console.log(`${colors.cyan}${colors.bold}📝 Add Translation${colors.reset}\n`);

    const namespace = partial.namespace || await prompt(`${colors.cyan}Namespace${colors.reset} (e.g. profile, header): `);
    const key = partial.key || await prompt(`${colors.cyan}Key${colors.reset} (e.g. my_new_key): `);
    const fr = partial.fr || await prompt(`${colors.cyan}French text${colors.reset}: `);
    const en = partial.en || await prompt(`${colors.cyan}English text${colors.reset}: `);

    return { namespace, key, fr, en };
}

function addTranslationToFile(entry: TranslationEntry): boolean {
    const i18nPath = path.join(process.cwd(), 'src', 'i18n.ts');
    let content = fs.readFileSync(i18nPath, 'utf-8');

    const escapedKey = entry.key;
    const escapedFr = entry.fr.replace(/"/g, '\\"');
    const escapedEn = entry.en.replace(/"/g, '\\"');

    // Find the namespace in FR block
    const frNamespaceRegex = new RegExp(
        `(fr:\\s*\\{[\\s\\S]*?translation:\\s*\\{[\\s\\S]*?${entry.namespace}:\\s*\\{)([\\s\\S]*?)(\\n\\s*\\},)`,
        'm'
    );

    const frMatch = content.match(frNamespaceRegex);
    if (!frMatch) {
        console.log(`${colors.red}❌ Could not find namespace "${entry.namespace}" in FR translations${colors.reset}`);
        console.log(`${colors.yellow}Tip: Create the namespace first, then add keys to it${colors.reset}`);
        return false;
    }

    // Check if key already exists
    if (frMatch[2].includes(`${escapedKey}:`)) {
        console.log(`${colors.yellow}⚠️  Key "${entry.key}" already exists in FR/${entry.namespace}${colors.reset}`);
        return false;
    }

    // Add to FR block
    const frNewContent = `${frMatch[1]}${frMatch[2]}                ${escapedKey}: "${escapedFr}",\n${frMatch[3]}`;
    content = content.replace(frNamespaceRegex, frNewContent);

    // Find the namespace in EN block
    const enNamespaceRegex = new RegExp(
        `(en:\\s*\\{[\\s\\S]*?translation:\\s*\\{[\\s\\S]*?${entry.namespace}:\\s*\\{)([\\s\\S]*?)(\\n\\s*\\},)`,
        'm'
    );

    const enMatch = content.match(enNamespaceRegex);
    if (!enMatch) {
        console.log(`${colors.yellow}⚠️  Could not find namespace "${entry.namespace}" in EN translations${colors.reset}`);
        console.log(`${colors.yellow}Adding only to FR for now...${colors.reset}`);
    } else {
        // Add to EN block
        const enNewContent = `${enMatch[1]}${enMatch[2]}                ${escapedKey}: "${escapedEn}",\n${enMatch[3]}`;
        content = content.replace(enNamespaceRegex, enNewContent);
    }

    // Write back
    fs.writeFileSync(i18nPath, content, 'utf-8');

    return true;
}

async function main() {
    const partial = parseArgs();

    // If all args provided, skip interactive mode
    const hasAllArgs = partial.namespace && partial.key && partial.fr && partial.en;

    if (hasAllArgs) {
        const entry = partial as TranslationEntry;
        console.log(`${colors.cyan}Adding translation:${colors.reset}`);
        console.log(`  Namespace: ${entry.namespace}`);
        console.log(`  Key: ${entry.key}`);
        console.log(`  FR: "${entry.fr}"`);
        console.log(`  EN: "${entry.en}"\n`);

        if (addTranslationToFile(entry)) {
            console.log(`${colors.green}${colors.bold}✅ Translation added successfully!${colors.reset}`);
        }
    } else {
        // Interactive mode
        const entry = await getTranslationEntry(partial);

        console.log(`\n${colors.cyan}Adding:${colors.reset}`);
        console.log(`  ${entry.namespace}.${entry.key}`);
        console.log(`  FR: "${entry.fr}"`);
        console.log(`  EN: "${entry.en}"\n`);

        if (addTranslationToFile(entry)) {
            console.log(`${colors.green}${colors.bold}✅ Translation added successfully!${colors.reset}`);
        }
    }
}

main().catch(console.error);
