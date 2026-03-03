import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, doc, query, orderBy, where, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Order } from '../types/models';
import { useAuthStore } from './authStore';
import { OrderStatus, PaymentStatus, PaymentMethod, UserRole } from '../constants/enums';

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;

    // Actions
    subscribeToOrders: () => () => void;
    placeOrder: (orderData: Omit<Order, 'orderId' | 'status' | 'timestamp' | 'estimatedPickupTime'>) => Promise<string>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    updateOrderPayment: (orderId: string, updates: Partial<Order>) => Promise<void>;
    confirmPayment: (orderId: string, paymentMethod: PaymentMethod.CASH | PaymentMethod.UPI, transactionId?: string) => Promise<void>;
    lockOrder: (orderId: string) => Promise<void>;
    unlockOrder: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    isLoading: false,
    error: null,

    subscribeToOrders: () => {
        set({ isLoading: true });

        const user = useAuthStore.getState().user;
        if (!user) {
            set({ orders: [], isLoading: false });
            return () => { };
        }

        let q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));

        // If not admin, only fetch their own orders
        if (user.role !== UserRole.ADMIN) {
            q = query(q, where('userId', '==', user.userId));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedOrders: Order[] = snapshot.docs.map(doc => {
                    const order = {
                        ...(doc.data() as Omit<Order, 'orderId'>),
                        orderId: doc.id
                    } as Order;
                    return order;
                });

                set({ orders: fetchedOrders, isLoading: false, error: null });
            },
            (error) => {
                set({ error: error.message, isLoading: false });
            }
        );

        return unsubscribe;
    },

    placeOrder: async (orderData) => {
        try {
            const orderRef = doc(collection(db, 'orders'));

            // Auto calculate estimated pickup time based on max preparation time
            let maxPrepTimeMinutes = 15; // default
            orderData.items.forEach(cartItem => {
                if (cartItem.menuItem.preparationTime && cartItem.menuItem.preparationTime > maxPrepTimeMinutes) {
                    maxPrepTimeMinutes = cartItem.menuItem.preparationTime;
                }
            });

            const estimatedPickupTime = Date.now() + (maxPrepTimeMinutes * 60000);

            const newOrder: Order = {
                ...orderData,
                orderId: orderRef.id,
                status: OrderStatus.PENDING,
                estimatedPickupTime,
                timestamp: Date.now(),
                notificationShown: false,
                isLocked: false,
                lockedBy: null
            };

            await setDoc(orderRef, newOrder);
            return newOrder.orderId;
        } catch (e: any) {
            console.error("Failed to place order", e);
            throw new Error("Failed to place order.");
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            // Guard: Cannot mark completed unless paid.
            if (status === OrderStatus.COMPLETED) {
                const state = useOrderStore.getState();
                const order = state.orders.find(o => o.orderId === orderId);
                if (order && order.paymentStatus !== PaymentStatus.PAID) {
                    throw new Error("Order must be paid before marking completed.");
                }
            }
            await updateDoc(doc(db, 'orders', orderId), { status });
        } catch (e: any) {
            console.error("Failed to update order status", e);
            throw e;
        }
    },

    updateOrderPayment: async (orderId, updates) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), updates);
        } catch (e: any) {
            console.error("Failed to update order payment", e);
            throw e;
        }
    },

    confirmPayment: async (orderId, paymentMethod, transactionId) => {
        try {
            const updates: Partial<Order> = {
                paymentStatus: PaymentStatus.PAID,
                paymentMethod,
                paidAt: Date.now(),
                status: OrderStatus.PENDING, // Move to pending once confirmed
                isLocked: false,
                lockedBy: null
            };
            if (transactionId) {
                updates.transactionId = transactionId;
            }
            await updateDoc(doc(db, 'orders', orderId), updates);
        } catch (e: any) {
            console.error("Failed to mark order as paid", e);
            throw e;
        }
    },

    lockOrder: async (orderId) => {
        try {
            const user = useAuthStore.getState().user;
            if (!user) return;
            await updateDoc(doc(db, 'orders', orderId), {
                isLocked: true,
                lockedBy: user.userId
            });
        } catch (e) {
            console.error("Failed to lock order", e);
        }
    },

    unlockOrder: async (orderId) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                isLocked: false,
                lockedBy: null
            });
        } catch (e) {
            console.error("Failed to unlock order", e);
        }
    }
}));

