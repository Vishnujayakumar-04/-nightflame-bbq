const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    let segments = filePath.split(/[\\/]/);
    let depth = segments.length - 1;
    let importPath = '';

    if (depth === 0) importPath = './constants/enums';
    else if (depth === 1) importPath = '../constants/enums';
    else if (depth === 2) importPath = '../../constants/enums';
    else if (depth === 3) importPath = '../../../constants/enums';

    const used = [];
    if (content.includes('OrderStatus')) used.push('OrderStatus');
    if (content.includes('PaymentStatus')) used.push('PaymentStatus');
    if (content.includes('PaymentType')) used.push('PaymentType');
    if (content.includes('PaymentMethod')) used.push('PaymentMethod');
    if (content.includes('UserRole')) used.push('UserRole');

    if (used.length === 0) return;
    if (content.includes('constants/enums')) return;

    const importStatement = `import { ${used.join(', ')} } from '${importPath}';`;

    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
    } else {
        lines.unshift(importStatement);
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Added imports to', filePath);
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'models.ts') continue;
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
