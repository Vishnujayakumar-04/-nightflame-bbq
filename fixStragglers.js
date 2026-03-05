const fs = require('fs');
const path = require('path');

function replacePatterns(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const map = [
        ['OrderStatus.pending', 'OrderStatus.PENDING'],
        ['OrderStatus.accepted', 'OrderStatus.ACCEPTED'],
        ['OrderStatus.preparing', 'OrderStatus.PREPARING'],
        ['OrderStatus.ready', 'OrderStatus.READY'],
        ['OrderStatus.completed', 'OrderStatus.COMPLETED'],
        ['PaymentMethodType', 'PaymentMethod'],
        ['paymentType: "PayNow"', 'paymentType: PaymentType.PAY_NOW'],
        ['paymentType: "PayLater"', 'paymentType: PaymentType.PAY_LATER'],
        ['paymentType: \'PayNow\'', 'paymentType: PaymentType.PAY_NOW'],
        ['paymentType: \'PayLater\'', 'paymentType: PaymentType.PAY_LATER'],
        ['paymentStatus: "Unpaid"', 'paymentStatus: PaymentStatus.UNPAID'],
        ['paymentStatus: \'Unpaid\'', 'paymentStatus: PaymentStatus.UNPAID'],
        ['paymentStatus: "Paid"', 'paymentStatus: PaymentStatus.PAID'],
        ['paymentStatus: \'Paid\'', 'paymentStatus: PaymentStatus.PAID'],
        ['paymentMethod: "Cash"', 'paymentMethod: PaymentMethod.CASH'],
        ['paymentMethod: \'Cash\'', 'paymentMethod: PaymentMethod.CASH'],
        ['paymentMethod: "UPI"', 'paymentMethod: PaymentMethod.UPI'],
        ['paymentMethod: \'UPI\'', 'paymentMethod: PaymentMethod.UPI'],
        ['role: "customer"', 'role: UserRole.CUSTOMER'],
        ['role: \'customer\'', 'role: UserRole.CUSTOMER'],
        ['role: "admin"', 'role: UserRole.ADMIN'],
        ['role: \'admin\'', 'role: UserRole.ADMIN'],
        ['role === \'admin\'', 'role === UserRole.ADMIN'],
        ['role !== \'admin\'', 'role !== UserRole.ADMIN'],
        ['"Payment Initiated"', 'PaymentStatus.PAYMENT_INITIATED'],
        ['\'Payment Initiated\'', 'PaymentStatus.PAYMENT_INITIATED']
    ];

    map.forEach(([search, replace]) => {
        // Simple string replacement loop exactly like before
        content = content.split(search).join(replace);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed stragglers in: ' + filePath);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'fixDualImports.js' || file === 'fixImports.js' || file === 'fixTokens.js') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') && !fullPath.includes('models.ts')) {
            replacePatterns(fullPath);
        }
    }
}

traverse('app');
traverse('components');
traverse('store');
