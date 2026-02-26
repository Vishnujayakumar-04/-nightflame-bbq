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
    adminLogin: (email: string, password: string) => Promise<void>;
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
                userData = doc.data() as User;
                // Update name if different and provided
                if (customerName && customerName !== userData.name) {
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

    adminLogin: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const userCred = await auth().signInWithEmailAndPassword(email, password);

            const userRef = firestore().collection('users').doc(userCred.user.uid);
            const doc = await userRef.get();

            if (doc.exists()) {
                set({ isLoading: false, user: doc.data() as User, error: null });
            } else {
                // Fallback if admin doc is missing but auth succeeds
                set({
                    isLoading: false,
                    user: {
                        userId: userCred.user.uid,
                        name: 'Admin',
                        phoneNumber: '',
                        createdAt: Date.now(),
                        role: 'admin'
                    }
                });
            }
        } catch {
            set({ isLoading: false, error: 'Invalid credentials' });
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
