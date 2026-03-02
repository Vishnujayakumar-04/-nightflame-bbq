import { create } from 'zustand';
import { auth, db } from '../firebaseConfig';
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types/models';

interface AuthState {
    isLoading: boolean;
    error: string | null;
    verificationId: string | null;
    phoneNumber: string | null;
    customerName: string | null;
    user: User | null;

    tempUid: string | null;

    // Actions
    setName: (name: string) => void;
    sendOtp: (phoneNumber: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<boolean>;
    completeRegistration: (name: string, dob: string) => Promise<void>;
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
    tempUid: null,
    user: null,

    setName: (name) => set({ customerName: name }),

    sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
            // Simulated OTP for Expo Go compatibility without native modules
            // (In a production bare workflow app, you would use RecaptchaVerifier or native Firebase)
            await new Promise(resolve => setTimeout(resolve, 800));

            set({
                isLoading: false,
                verificationId: 'mock-verification-id',
                phoneNumber: phone
            });
        } catch (_e: any) {
            set({ isLoading: false, error: _e.message || 'Failed to send OTP' });
        }
    },

    verifyOtp: async (otp: string) => {
        const { verificationId } = get();
        if (!verificationId) return false;

        if (otp !== '123456') {
            set({ error: 'Invalid OTP. For testing, use 123456' });
            throw new Error('Invalid OTP');
        }

        set({ isLoading: true, error: null });
        try {
            // Because Anonymous Auth is disabled on the Firebase project, simulate a deterministic UID
            const mockUid = `user_${get().phoneNumber?.replace(/\D/g, '') || Math.random().toString(36).substring(2, 10)}`;
            console.log('Verifying with Mock UID:', mockUid);

            // Check user in Firestore
            const userRef = doc(db, 'users', mockUid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const existingData = docSnap.data() as User;
                set({ isLoading: false, user: existingData, error: null });
                return false; // Not a new user
            } else {
                set({ isLoading: false, tempUid: mockUid, error: null });
                return true; // Is a new user
            }
        } catch (e: any) {
            let userFriendlyError = e.message || 'Verification Error';

            // Helpful tip for the "Insufficient Permissions" error
            if (e.code === 'permission-denied') {
                userFriendlyError = 'Firestore Error: Please set your Firebase Rules to "allow read, write: if true;" in the console.';
            }

            set({ isLoading: false, error: userFriendlyError });
            throw new Error(userFriendlyError);
        }
    },

    completeRegistration: async (name, dob) => {
        const { tempUid, phoneNumber } = get();
        if (!tempUid) return;

        set({ isLoading: true, error: null });
        try {
            const userRef = doc(db, 'users', tempUid);
            const userData: User = {
                userId: tempUid,
                name: name,
                phoneNumber: `+ 91${phoneNumber} `,
                dob: dob,
                createdAt: Date.now(),
                role: 'customer'
            };
            await setDoc(userRef, userData);
            set({ isLoading: false, user: userData, tempUid: null, error: null });
        } catch {
            set({ isLoading: false, error: 'Registration failed.' });
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
            await firebaseSignOut(auth);
            set({ user: null, verificationId: null, isLoading: false, error: null });
        } catch {
            set({ isLoading: false });
        }
    },

    checkAuthState: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (docSnap.exists()) {
                        set({ user: docSnap.data() as User });
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
