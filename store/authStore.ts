import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types/models';

interface AuthState {
    isLoading: boolean;
    error: string | null;
    verificationId: string | null;
    phoneNumber: string | null;
    customerName: string | null;
    user: User | null;

    // Actions
    setName: (name: string) => void;
    sendOtp: (phoneNumber: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    adminLogin: (pin: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    checkAuthState: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isLoading: false,
    error: null,
    verificationId: null,
    phoneNumber: null,
    customerName: null,
    user: null,

    setName: (name) => set({ customerName: name }),

    sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
            const fullPhone = `+91${phone}`;

            const confirmation = await auth().signInWithPhoneNumber(fullPhone);

            set({
                isLoading: false,
                verificationId: confirmation.verificationId,
                phoneNumber: phone
            });
        } catch (_e: any) {
            set({ isLoading: false, error: _e.message || 'Failed to send OTP' });
        }
    },

    verifyOtp: async (otp) => {
        const { verificationId, phoneNumber, customerName } = get();
        if (!verificationId) return;

        set({ isLoading: true, error: null });
        try {
            const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
            const userCred = await auth().signInWithCredential(credential);

            // Get or create user in Firestore
            const userRef = firestore().collection('users').doc(userCred.user.uid);
            const doc = await userRef.get();

            let userData: User;

            if (doc.exists()) {
                const existingData = doc.data() as User;
                userData = existingData;
                // Update name if different and provided
                if (customerName && customerName !== existingData.name) {
                    await userRef.update({ name: customerName });
                    userData.name = customerName;
                }
            } else {
                userData = {
                    userId: userCred.user.uid,
                    name: customerName || 'Customer',
                    phoneNumber: `+91${phoneNumber}`,
                    createdAt: Date.now(),
                    role: 'customer'
                };
                await userRef.set(userData);
            }

            set({ isLoading: false, user: userData, error: null });
        } catch {
            set({ isLoading: false, error: 'Invalid OTP. Please try again.' });
        }
    },

    adminLogin: async (pin) => {
        set({ isLoading: true, error: null });

        // Demo PIN verification — replace with server-side check in production
        const ADMIN_PIN = '1234';

        // Simulate a brief network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pin === ADMIN_PIN) {
            set({
                isLoading: false,
                user: {
                    userId: 'admin-local',
                    name: 'Admin',
                    phoneNumber: '',
                    createdAt: Date.now(),
                    role: 'admin'
                },
                error: null
            });
            return true;
        } else {
            set({ isLoading: false, error: 'Invalid PIN' });
            return false;
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await auth().signOut();
            set({ user: null, verificationId: null, isLoading: false, error: null });
        } catch {
            set({ isLoading: false });
        }
    },

    checkAuthState: () => {
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const doc = await firestore().collection('users').doc(firebaseUser.uid).get();
                    if (doc.exists()) {
                        set({ user: doc.data() as User });
                    } else {
                        // Handle edge case where user is in Auth but not Firestore
                        set({ user: null });
                    }
                } catch (e) {
                    console.error('Error fetching user data from Firestore', e);
                }
            } else {
                set({ user: null });
            }
        });

        return unsubscribe;
    }
}));
