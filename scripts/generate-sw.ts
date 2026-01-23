import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.resolve(__dirname, '..');
const templatePath = path.join(rootDir, 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.join(rootDir, 'public', 'firebase-messaging-sw.js');
const envPath = path.join(rootDir, '.env');

console.log('🔄 Generating public/firebase-messaging-sw.js from template...');

// Helper to read .env file manualy
function loadEnv(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Warning: .env file not found at ${filePath}. Using process.env only.`);
        return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
            env[key] = value;
        }
    });
    return env;
}

// 1. Load env vars (process.env takes precedence, but we load .env for local dev)
const dotEnvVars = loadEnv(envPath);
const allEnv = { ...dotEnvVars, ...process.env }; // Merge

// 2. Read template
if (!fs.existsSync(templatePath)) {
    console.error(`❌ Error: Template not found at ${templatePath}`);
    process.exit(1);
}
let template = fs.readFileSync(templatePath, 'utf-8');

// 3. Replace placeholders
const keysToReplace = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
];

let missingKeys: string[] = [];

keysToReplace.forEach(key => {
    const value = allEnv[key];
    if (!value) {
        missingKeys.push(key);
    }
    // Replace {{KEY}} with value
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value || '');
});

if (missingKeys.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables for: ${missingKeys.join(', ')}`);
}

// 4. Write output
fs.writeFileSync(outputPath, template);
console.log('✅ public/firebase-messaging-sw.js generated successfully!');
