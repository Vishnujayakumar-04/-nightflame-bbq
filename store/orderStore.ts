import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, doc, query, orderBy, where, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../types/models';
import { useAuthStore } from './authStore';

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;

    // Actions
    subscribeToOrders: () => () => void;
    placeOrder: (orderData: Omit<Order, 'orderId' | 'status' | 'timestamp'>) => Promise<string>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    updateOrderPayment: (orderId: string, updates: Partial<Order>) => Promise<void>;
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
        if (user.role !== 'admin') {
            q = query(q, where('userId', '==', user.userId));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
                    ...(doc.data() as Omit<Order, 'orderId'>),
                    orderId: doc.id
                }));

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

            const newOrder: Order = {
                ...orderData,
                orderId: orderRef.id,
                status: OrderStatus.pending,
                timestamp: Date.now()
            };

            await setDoc(orderRef, newOrder);
            return newOrder.orderId;
        } catch (e: any) {
            console.error("Failed to place order", e);
            // eslint-disable-next-line preserve-caught-error
            throw new Error("Failed to place order.");
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status });
        } catch (e: any) {
            console.error("Failed to update order status", e);
        }
    },

    updateOrderPayment: async (orderId, updates) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), updates);
        } catch (e: any) {
            console.error("Failed to update order payment", e);
            throw e;
        }
    }
}));
