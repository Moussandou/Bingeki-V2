const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const srcDir = path.join(process.cwd(), 'src');
const files = getAllFiles(srcDir);
const report = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let count = 0;
    lines.forEach(line => {
        // Basic regex to find ': any' or 'as any' or '<any>'
        // Avoiding comments is hard without a parser, but this is a rough estimate script
        if (line.match(/: ?any\b/) || line.match(/as ?any\b/) || line.match(/<any>/)) {
            count++;
        }
    });

    if (count > 0) {
        report.push({ file: path.relative(process.cwd(), file), count });
    }
});

report.sort((a, b) => b.count - a.count);

console.log('--- Files with most "any" types ---');
report.forEach(item => {
    console.log(`${item.count.toString().padEnd(5)} ${item.file}`);
});
console.log('-----------------------------------');
console.log(`Total occurrences: ${report.reduce((a, b) => a + b.count, 0)}`);
