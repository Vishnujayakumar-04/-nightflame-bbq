import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
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

        let query = firestore().collection('orders').orderBy('timestamp', 'desc');

        // If not admin, only fetch their own orders
        if (user.role !== 'admin') {
            query = query.where('userId', '==', user.userId);
        }

        const unsubscribe = query.onSnapshot(
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
            const orderRef = firestore().collection('orders').doc();

            const newOrder: Order = {
                ...orderData,
                orderId: orderRef.id,
                status: OrderStatus.pending,
                timestamp: Date.now()
            };

            await orderRef.set(newOrder);
            return newOrder.orderId;
        } catch (e: any) {
            console.error("Failed to place order", e);
            // eslint-disable-next-line preserve-caught-error
            throw new Error("Failed to place order.");
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await firestore().collection('orders').doc(orderId).update({ status });
        } catch (e: any) {
            console.error("Failed to update order status", e);
        }
    }
}));
