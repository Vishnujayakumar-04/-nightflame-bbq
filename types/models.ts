export interface MenuItem {
    itemId: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    available: boolean;
    category: string;
    createdAt: number;
    preparationTime?: number;
    isCombo?: boolean;
    comboItems?: string[]; // Array of itemIds or descriptors if it's a combo
}

export interface ShopStatus {
    isOpen: boolean;
    openTime: string; // e.g. "06:00 PM"
    closeTime: string; // e.g. "11:00 PM"
    message?: string; // Custom message for closed status
    lastUpdated: number;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
}

export enum OrderStatus {
    pending = 'pending',
    preparing = 'preparing',
    ready = 'ready',
    completed = 'completed'
}

export interface Order {
    orderId: string;
    userId: string | null; // null for walk-ins
    customerName?: string; // name for walk-ins
    items: CartItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: 'Unpaid' | 'Paid';
    paymentMethod: 'Cash' | 'UPI' | 'None';
    transactionId?: string; // Required if UPI & Paid
    pickupTime: number; // timestamp
    estimatedPickupTime?: number;
    timestamp: number; // creation timestamp
    paidAt?: number;
}

export interface User {
    userId: string;
    name: string;
    phoneNumber: string;
    dob?: string;
    createdAt: number;
    role: 'customer' | 'admin';
}
