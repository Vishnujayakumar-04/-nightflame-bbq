import { create } from 'zustand';
import { CartItem, MenuItem } from '../types/models';

interface CartState {
    items: CartItem[];
    addItem: (item: MenuItem, specialInstructions?: string) => void;
    removeItem: (itemId: string) => void;
    incrementQuantity: (itemId: string) => void;
    decrementQuantity: (itemId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
    getItemQuantity: (itemId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (menuItem: MenuItem, specialInstructions?: string) => {
        set((state) => {
            const existingItem = state.items.find((i) => i.menuItem.itemId === menuItem.itemId);
            if (existingItem) {
                return {
                    items: state.items.map((i) =>
                        i.menuItem.itemId === menuItem.itemId
                            ? { ...i, quantity: i.quantity + 1, specialInstructions: specialInstructions || i.specialInstructions }
                            : i
                    ),
                };
            }
            return { items: [...state.items, { menuItem, quantity: 1, specialInstructions }] };
        });
    },

    removeItem: (itemId: string) => {
        set((state) => ({
            items: state.items.filter((i) => i.menuItem.itemId !== itemId),
        }));
    },

    incrementQuantity: (itemId: string) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.menuItem.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
        }));
    },

    decrementQuantity: (itemId: string) => {
        set((state) => {
            const item = state.items.find((i) => i.menuItem.itemId === itemId);
            if (item && item.quantity <= 1) {
                return {
                    items: state.items.filter((i) => i.menuItem.itemId !== itemId),
                };
            }
            return {
                items: state.items.map((i) =>
                    i.menuItem.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
                ),
            };
        });
    },

    clearCart: () => set({ items: [] }),

    getCartTotal: () => {
        return get().items.reduce(
            (total, item) => total + item.menuItem.price * item.quantity,
            0
        );
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },

    getItemQuantity: (itemId: string) => {
        const item = get().items.find((i) => i.menuItem.itemId === itemId);
        return item ? item.quantity : 0;
    },
}));

