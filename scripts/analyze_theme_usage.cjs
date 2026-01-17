const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const hardcodedPatterns = [
    '#000', '#000000', '#fff', '#ffffff', '#f4f4f4', '#f0f0f0',
    'black', 'white', 'rgba(0, 0, 0', 'rgba(255, 255, 255'
];

const ignoredFiles = [
    'tokens.css', // Defines variables
    'index.css', // Base styles often have defaults
    'vite-env.d.ts'
];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDirectory(filePath);
        } else if (
            (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) &&
            !ignoredFiles.includes(file)
        ) {
            checkFile(filePath);
        }
    });
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    let hasIssues = false;

    const lines = content.split('\n');
    lines.forEach((line, index) => {
        hardcodedPatterns.forEach(pattern => {
            // Simple check, can be improved to avoid comments/strings if needed
            if (line.includes(pattern) && !line.includes('var(--')) {
                // Filter out some common false positives or legitimate uses if needed
                // e.g. console.log, or specific known-good lines
                if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

                if (!hasIssues) {
                    console.log(`\n📄 ${relativePath}:`);
                    hasIssues = true;
                }
                console.log(`  Line ${index + 1}: Found "${pattern}" -> ${line.trim()}`);
            }
        });
    });
}

console.log('🔍 Scanning for hardcoded colors...');
scanDirectory(srcDir);
console.log('\n✅ Scan complete.');
