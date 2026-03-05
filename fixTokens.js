/* eslint-disable */
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Define replacements carefully. Do not use global replace mindlessly if not needed, 
    // but here we just ensure 'pending' becomes OrderStatus.PENDING etc.
    const replacements = [
        ["status === 'pending'", "status === OrderStatus.PENDING"],
        ["status !== 'pending'", "status !== OrderStatus.PENDING"],
        ["currentStatus === OrderStatus.pending", "currentStatus === OrderStatus.PENDING"],

        ["status === 'accepted'", "status === OrderStatus.ACCEPTED"],
        ["status !== 'accepted'", "status !== OrderStatus.ACCEPTED"],
        ["currentStatus === OrderStatus.accepted", "currentStatus === OrderStatus.ACCEPTED"],

        ["status === 'preparing'", "status === OrderStatus.PREPARING"],
        ["status !== 'preparing'", "status !== OrderStatus.PREPARING"],
        ["currentStatus === OrderStatus.preparing", "currentStatus === OrderStatus.PREPARING"],

        ["status === 'ready'", "status === OrderStatus.READY"],
        ["status !== 'ready'", "status !== OrderStatus.READY"],
        ["currentStatus === OrderStatus.ready", "currentStatus === OrderStatus.READY"],

        ["status === 'completed'", "status === OrderStatus.COMPLETED"],
        ["status !== 'completed'", "status !== OrderStatus.COMPLETED"],
        ["currentStatus === OrderStatus.completed", "currentStatus === OrderStatus.COMPLETED"],

        ["paymentStatus === 'Unpaid'", "paymentStatus === PaymentStatus.UNPAID"],
        ["paymentStatus !== 'Unpaid'", "paymentStatus !== PaymentStatus.UNPAID"],

        ["paymentStatus === 'Paid'", "paymentStatus === PaymentStatus.PAID"],
        ["paymentStatus !== 'Paid'", "paymentStatus !== PaymentStatus.PAID"],

        ["paymentStatus === 'Payment Initiated'", "paymentStatus === PaymentStatus.PAYMENT_INITIATED"],
        ["paymentStatus !== 'Payment Initiated'", "paymentStatus !== PaymentStatus.PAYMENT_INITIATED"],

        ["paymentMethod === 'Cash'", "paymentMethod === PaymentMethod.CASH"],
        ["paymentMethod: 'Cash'", "paymentMethod: PaymentMethod.CASH"],
        ["paymentMethod === 'UPI'", "paymentMethod === PaymentMethod.UPI"],
        ["paymentMethod: 'UPI'", "paymentMethod: PaymentMethod.UPI"],

        ["paymentType: 'PayNow'", "paymentType: PaymentType.PAY_NOW"],
        ["paymentType === 'PayNow'", "paymentType === PaymentType.PAY_NOW"],
        ["paymentType: 'PayLater'", "paymentType: PaymentType.PAY_LATER"],
        ["paymentType === 'PayLater'", "paymentType === PaymentType.PAY_LATER"],

        // Handle the bad mapping in orders.tsx generated previously:
        ["currentStatus === OrderStatus.confirmed", "currentStatus === OrderStatus.ACCEPTED"],
        ["OrderStatus.CONFIRMED", "OrderStatus.ACCEPTED"]
    ];

    let newContent = content;
    for (const [search, replace] of replacements) {
        // Need to replace all instances
        newContent = newContent.split(search).join(replace);
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
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
