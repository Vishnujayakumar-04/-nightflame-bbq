import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, doc, query, orderBy, where, onSnapshot, updateDoc, runTransaction } from 'firebase/firestore';
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

        // For admin: fetch all orders
        // For customers: fetch only their orders
        // IMPORTANT: Avoid compound queries (where + orderBy on different fields)
        // as they require Firestore composite indexes. We sort client-side instead.
        let q;
        if (user.role === UserRole.ADMIN) {
            q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
        } else {
            // Simple query — no composite index needed
            q = query(collection(db, 'orders'), where('userId', '==', user.userId));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedOrders: Order[] = snapshot.docs.map(docSnap => {
                    return {
                        ...(docSnap.data() as Omit<Order, 'orderId'>),
                        orderId: docSnap.id
                    } as Order;
                });

                // Client-side sort by timestamp descending (newest first)
                fetchedOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                set({ orders: fetchedOrders, isLoading: false, error: null });
            },
            (error) => {
                console.error('[OrderStore] Subscription error:', error.message);
                set({ error: error.message, isLoading: false });
            }
        );

        return unsubscribe;
    },

    placeOrder: async (orderData) => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`; // YYYYMMDD

            const counterId = `orders_${dateStr}`;
            const counterRef = doc(db, 'counters', counterId);
            const orderRef = doc(collection(db, 'orders'));

            const result = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                let runningNumber = 1;

                if (counterDoc.exists()) {
                    runningNumber = counterDoc.data().lastOrderNumber + 1;
                    transaction.update(counterRef, { lastOrderNumber: runningNumber });
                } else {
                    transaction.set(counterRef, {
                        date: dateStr,
                        lastOrderNumber: runningNumber
                    });
                }

                // Format: BQ-YYYYMMDD-XXX
                const paddedNumber = String(runningNumber).padStart(3, '0');
                const orderNumber = `BQ-${dateStr}-${paddedNumber}`;

                // Auto calculate estimated pickup time based on max preparation time
                let maxPrepTimeMinutes = 15;
                orderData.items.forEach(cartItem => {
                    if (cartItem.menuItem.preparationTime && cartItem.menuItem.preparationTime > maxPrepTimeMinutes) {
                        maxPrepTimeMinutes = cartItem.menuItem.preparationTime;
                    }
                });

                const estimatedPickupTime = Date.now() + (maxPrepTimeMinutes * 60000);

                const newOrder: Order = {
                    ...orderData,
                    orderId: orderRef.id,
                    orderNumber,
                    runningNumber,
                    status: orderData.userId === 'walk-in' ? OrderStatus.ACCEPTED : OrderStatus.PENDING,
                    estimatedPickupTime,
                    timestamp: Date.now(),
                    notificationShown: false,
                    isLocked: false,
                    lockedBy: null
                };

                // Deep strip all nested undefined values (Firestore strict mode)
                const cleanOrder = JSON.parse(JSON.stringify(newOrder));

                transaction.set(orderRef, cleanOrder);
                return { orderId: orderRef.id, orderNumber };
            });

            return result.orderId;
        } catch (e: any) {
            console.error("Failed to place order", e);
            throw new Error(e.message || "Failed to place order.", { cause: e });
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const state = useOrderStore.getState();
            const order = state.orders.find(o => o.orderId === orderId);
            
            if (!order) throw new Error("Order not found.");

            const isWalkIn = order.userId === 'walk-in';

            // Strict Transitions Enforcement
            const validTransitions: Record<OrderStatus, OrderStatus[]> = {
                [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
                [OrderStatus.ACCEPTED]: isWalkIn
                    ? [OrderStatus.COMPLETED, OrderStatus.CANCELLED]  // Walk-in shortcut
                    : [OrderStatus.PREPARING, OrderStatus.CANCELLED],
                [OrderStatus.PREPARING]: [OrderStatus.READY],
                [OrderStatus.READY]: [OrderStatus.COMPLETED],
                [OrderStatus.COMPLETED]: [],
                [OrderStatus.CANCELLED]: []
            };

            if (!validTransitions[order.status].includes(status)) {
                throw new Error(`Invalid status transition from ${order.status} to ${status}`);
            }

            // Guard: Cannot mark completed unless paid.
            if (status === OrderStatus.COMPLETED) {
                if (order.paymentStatus !== PaymentStatus.PAID) {
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
            const state = useOrderStore.getState();
            const order = state.orders.find(o => o.orderId === orderId);

            const updates: Partial<Order> = {
                paymentStatus: PaymentStatus.PAID,
                paymentMethod,
                paidAt: Date.now(),
                isLocked: false,
                lockedBy: null
            };

            // Auto-complete Walk-in orders as soon as payment is collected
            if (order && order.userId === 'walk-in') {
                updates.status = OrderStatus.COMPLETED;
            }

            if (transactionId && transactionId.trim() !== '') {
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

