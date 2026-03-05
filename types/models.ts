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
    todaySpecialItemId?: string; // Admin-set daily special menu item ID
    lastUpdated: number;
}

import { OrderStatus, PaymentStatus, PaymentType, PaymentMethod, UserRole } from '../constants/enums';

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    specialInstructions?: string;
}

export interface Order {
    orderId: string;
    userId: string | null; // null for walk-ins
    customerName?: string; // name for walk-ins
    items: CartItem[];
    totalAmount: number;
    orderNumber: string;
    runningNumber: number;
    status: OrderStatus;

    // Hardened Payment Schema
    paymentType: PaymentType;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    transactionId?: string | null; // Required if UPI & Paid
    paidAt?: number | null;
    notificationShown: boolean;

    // Safety Lock
    isLocked: boolean;
    lockedBy: string | null;

    pickupTime: number; // timestamp
    estimatedPickupTime?: number;
    timestamp: number; // creation timestamp
}

export interface User {
    userId: string;
    name: string;
    phoneNumber: string;
    dob?: string;
    address: string;
    profilePhotoUri?: string;
    createdAt: number;
    role: UserRole;
}

