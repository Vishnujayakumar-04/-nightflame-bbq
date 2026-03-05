/* eslint-disable */
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // We want to remove OrderStatus, PaymentStatus, etc from the types/models import.
    // E.g. `import { Order, OrderStatus, ShopStatus } from '../types/models';` -> 
    // `import { Order, ShopStatus } from '../types/models';`

    const importsToRemove = ['OrderStatus', 'PaymentStatus', 'PaymentType', 'PaymentMethod', 'UserRole'];

    let original = content;

    // Use regex to locate imports from anything matching 'types/models'
    // This is a naive but effective way
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('models') && lines[i].includes('import')) {
            importsToRemove.forEach(t => {
                // Regex to remove the exact word, handling trailing/leading commas
                const regex = new RegExp(`\\b${t}\\b\\s*,?`, 'g');
                lines[i] = lines[i].replace(regex, '');
            });
            // Cleanup any hanging `{ ,` or `, }`
            lines[i] = lines[i].replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
            // If the import is empty like `import { } from ...` remove it entirely
            if (lines[i].match(/import\s*{\s*}\s*from/)) {
                lines[i] = '';
            }
        }
    }

    content = lines.join('\n');
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned models imports from: ' + filePath);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

traverse('app');
traverse('components');
traverse('store');
