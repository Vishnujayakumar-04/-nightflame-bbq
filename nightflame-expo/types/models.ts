export interface MenuItem {
    itemId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    available: boolean;
    category: string;
    createdAt: number;
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
    userId: string;
    items: CartItem[];
    totalAmount: number;
    status: OrderStatus;
    pickupTime: number; // timestamp
    timestamp: number; // creation timestamp
}

export interface User {
    userId: string;
    name: string;
    phoneNumber: string;
    createdAt: number;
    role: 'customer' | 'admin';
}
