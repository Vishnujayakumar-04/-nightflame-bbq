/* eslint-disable */
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. In `AdminPaymentModal.tsx`, we need to remove the local `PaymentMethod` and `PaymentMethodType`
    if (filePath.includes('AdminPaymentModal.tsx')) {
        content = content.replace(/export type PaymentMethodType.*?\n/, '');
        content = content.replace(/type PaymentMethod =.*?\n/, '');
    }

    if (filePath.includes('cart.tsx')) {
        content = content.replace(/\| "PayLater"/g, '');
        content = content.replace(/"PayLater" \| /g, '');
        content = content.replace(/\| "UPI" \| null/g, '');
        content = content.replace(/"UPI" \| null/g, 'PaymentMethod | null');
        content = content.replace(/\| "Unpaid"/g, '');
        content = content.replace(/"Unpaid" \| /g, '');
    }

    // 2. Dashboard & Orders: remove PaymentMethodType
    if (filePath.includes('dashboard.tsx') || filePath.includes('orders.tsx')) {
        content = content.replace(/, PaymentMethodType/g, '');
        content = content.replace(/import { AdminPaymentModal } from.*?;/g, "import { AdminPaymentModal } from '../../components/AdminPaymentModal';");
    }

    const segments = filePath.split(/[\\/]/);
    const depth = segments.length - 1;
    let enumPath = '';

    if (depth === 0) enumPath = './constants/enums';
    else if (depth === 1) enumPath = '../constants/enums';
    else if (depth === 2) enumPath = '../../constants/enums';
    else if (depth === 3) enumPath = '../../../constants/enums';

    const usesUserRole = content.includes('UserRole');
    const usesPaymentStatus = content.includes('PaymentStatus');
    const usesPaymentType = content.includes('PaymentType');

    const importsFound = content.match(/import\s*{([^}]+)}\s*from\s*['"].*constants\/enums['"]/);
    if (importsFound) {
        let currentImports = importsFound[1].split(',').map(s => s.trim());
        if (usesUserRole && !currentImports.includes('UserRole')) currentImports.push('UserRole');
        if (usesPaymentStatus && !currentImports.includes('PaymentStatus')) currentImports.push('PaymentStatus');
        if (usesPaymentType && !currentImports.includes('PaymentType')) currentImports.push('PaymentType');

        content = content.replace(importsFound[0], `import { ${currentImports.join(', ')} } from '${enumPath}'`);
    } else {
        const needsImports = [];
        if (usesUserRole) needsImports.push('UserRole');
        if (usesPaymentStatus) needsImports.push('PaymentStatus');
        if (usesPaymentType) needsImports.push('PaymentType');

        if (needsImports.length > 0) {
            content = `import { ${needsImports.join(', ')} } from '${enumPath}';\n` + content;
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed final types in: ' + filePath);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'fixDualImports.js' || file === 'fixImports.js' || file === 'fixTokens.js' || file === 'fixStragglers.js') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') && !fullPath.includes('models.ts')) {
            processFile(fullPath);
        }
    }
}

traverse('app');
traverse('components');
traverse('store');
