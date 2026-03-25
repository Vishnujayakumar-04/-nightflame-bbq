import { Order } from '../types/models';

/**
 * Formats a number as Indian Rupee currency (₹)
 */
export const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(0)}`;
};

/**
 * Returns a human-readable order ID
 */
export const formatOrderIdShort = (order: Order): string => {
    if (order.orderNumber) {
        return `#${String(order.runningNumber).padStart(3, '0')}`;
    }
    return `#${order.orderId.substring(0, 4).toUpperCase()}`;
};

/**
 * Returns a relative time string (e.g., "5m ago")
 */
export const getRelativeTime = (timestamp: number): string => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
};

/**
 * Formats a timestamp into HH:MM AM/PM
 */
export const formatTime = (ts?: number | Date): string => {
    if (!ts) return 'N/A';
    const d = typeof ts === 'number' ? new Date(ts) : ts;
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/**
 * Formats a timestamp into DD MMM YYYY
 */
export const formatDate = (ts?: number | Date): string => {
    if (!ts) return 'N/A';
    const d = typeof ts === 'number' ? new Date(ts) : ts;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
