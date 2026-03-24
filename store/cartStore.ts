import { create } from 'zustand';
import { CartItem, MenuItem, SelectedAddOn } from '../types/models';

interface CartState {
    items: (CartItem & { cartItemId: string })[];
    addItem: (menuItem: MenuItem, specialInstructions?: string, selectedAddOns?: SelectedAddOn[]) => void;
    removeItem: (cartItemId: string) => void;
    incrementQuantity: (cartItemId: string) => void;
    decrementQuantity: (cartItemId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
    getItemQuantity: (itemId: string) => number;
}

// Generate a unique ID based on the item and its identical addons
const generateCartItemId = (itemId: string, addOns?: SelectedAddOn[]) => {
    if (!addOns || addOns.length === 0) return itemId;
    // Sort add-ons by name so the hash is consistent
    const sorted = [...addOns].sort((a, b) => a.name.localeCompare(b.name));
    const addOnStr = sorted.map(a => `${a.name}(${a.quantity})`).join('-');
    return `${itemId}-${addOnStr}`;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (menuItem: MenuItem, specialInstructions?: string, selectedAddOns?: SelectedAddOn[]) => {
        set((state) => {
            const cartItemId = generateCartItemId(menuItem.itemId, selectedAddOns);
            const existingItem = state.items.find((i) => i.cartItemId === cartItemId);
            
            if (existingItem) {
                return {
                    items: state.items.map((i) =>
                        i.cartItemId === cartItemId
                            ? { ...i, quantity: i.quantity + 1, specialInstructions: specialInstructions || i.specialInstructions }
                            : i
                    ),
                };
            }
            return { 
                items: [...state.items, { 
                    cartItemId, 
                    menuItem, 
                    quantity: 1, 
                    specialInstructions,
                    selectedAddOns 
                }] 
            };
        });
    },

    removeItem: (cartItemId: string) => {
        set((state) => ({
            items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
    },

    incrementQuantity: (cartItemId: string) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
        }));
    },

    decrementQuantity: (cartItemId: string) => {
        set((state) => {
            const item = state.items.find((i) => i.cartItemId === cartItemId);
            if (item && item.quantity <= 1) {
                return {
                    items: state.items.filter((i) => i.cartItemId !== cartItemId),
                };
            }
            return {
                items: state.items.map((i) =>
                    i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
                ),
            };
        });
    },

    clearCart: () => set({ items: [] }),

    getCartTotal: () => {
        return get().items.reduce((total, item) => {
            // Base item price
            let itemTotal = item.menuItem.price;
            
            // Add addons price
            if (item.selectedAddOns) {
                item.selectedAddOns.forEach(addon => {
                    itemTotal += (addon.price * addon.quantity);
                });
            }
            
            // Multiply by cart quantity
            return total + (itemTotal * item.quantity);
        }, 0);
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },

    // Used for showing total quantity of a base item across all customizations
    getItemQuantity: (itemId: string) => {
        return get().items
            .filter((i) => i.menuItem.itemId === itemId)
            .reduce((total, i) => total + i.quantity, 0);
    },
}));
