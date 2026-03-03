import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ShopStatus } from '../types/models';

interface ShopState {
    status: ShopStatus | null;
    isLoading: boolean;
    error: string | null;

    subscribeToStatus: () => () => void;
    updateStatus: (updates: Partial<ShopStatus>) => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
    status: null,
    isLoading: false,
    error: null,

    subscribeToStatus: () => {
        set({ isLoading: true });
        const unsubscribe = onSnapshot(doc(db, 'settings', 'shopStatus'), (snapshot) => {
            if (snapshot.exists()) {
                set({ status: snapshot.data() as ShopStatus, isLoading: false });
            } else {
                // Initialize default status if it doesn't exist
                const defaultStatus: ShopStatus = {
                    isOpen: true,
                    openTime: '06:00 PM',
                    closeTime: '11:00 PM',
                    message: '',
                    lastUpdated: Date.now()
                };
                set({ status: defaultStatus, isLoading: false });
                setDoc(doc(db, 'settings', 'shopStatus'), defaultStatus);
            }
        }, (err) => {
            set({ error: err.message, isLoading: false });
        });
        return unsubscribe;
    },

    updateStatus: async (updates) => {
        try {
            const statusRef = doc(db, 'settings', 'shopStatus');
            await setDoc(statusRef, {
                ...updates,
                lastUpdated: Date.now()
            }, { merge: true });
        } catch (e: any) {
            console.error('Update status error:', e);
        }
    }
}));

