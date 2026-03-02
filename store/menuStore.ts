import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { MenuItem } from '../types/models';

interface MenuState {
    menuItems: MenuItem[];
    isLoading: boolean;
    error: string | null;

    // Actions
    subscribeToMenu: () => () => void; // Returns unsubscribe
    addMenuItem: (item: Omit<MenuItem, 'itemId' | 'createdAt'>) => Promise<void>;
    updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>;
    deleteMenuItem: (itemId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
    menuItems: [],
    isLoading: false,
    error: null,

    subscribeToMenu: () => {
        set({ isLoading: true });

        // Listen to real-time updates from Firestore
        const unsubscribe = onSnapshot(
            collection(db, 'menuItems'),
            (snapshot) => {
                const items: MenuItem[] = snapshot.docs.map(doc => ({
                    ...(doc.data() as Omit<MenuItem, 'itemId'>),
                    itemId: doc.id
                }));

                set({ menuItems: items, isLoading: false, error: null });
            },
            (error) => {
                set({ error: error.message, isLoading: false });
            }
        );

        return unsubscribe;
    },

    addMenuItem: async (item) => {
        try {
            const newItemRef = doc(collection(db, 'menuItems'));
            await setDoc(newItemRef, {
                ...item,
                createdAt: Date.now()
            });
        } catch (e: any) {
            console.error("Failed to add menu item", e);
        }
    },

    updateMenuItem: async (itemId, updates) => {
        try {
            await updateDoc(doc(db, 'menuItems', itemId), updates);
        } catch (e: any) {
            console.error("Failed to update menu item", e);
        }
    },

    deleteMenuItem: async (itemId) => {
        try {
            await deleteDoc(doc(db, 'menuItems', itemId));
        } catch (e: any) {
            console.error("Failed to delete menu item", e);
        }
    }
}));
