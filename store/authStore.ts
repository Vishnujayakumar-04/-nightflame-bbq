import { UserRole } from '../constants/enums';
import { create } from 'zustand';
import { auth, db } from '../firebaseConfig';
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    isInitializing: boolean;
    isLoading: boolean;
    error: string | null;
    verificationId: string | null;
    phoneNumber: string | null;
    customerName: string | null;
    dob: string | null;
    customerAddress: string | null;
    profilePhotoUri: string | null;
    user: User | null;

    tempUid: string | null;

    // Actions
    setName: (name: string) => void;
    setAddress: (address: string) => void;
    setProfilePhoto: (uri: string) => void;
    sendOtp: (phoneNumber: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<boolean>;
    completeRegistration: () => Promise<void>;
    adminLogin: (pin: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    checkAuthState: () => () => void; // Returns unsubscribe function
    loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isInitializing: true,
    isLoading: false,
    error: null,
    verificationId: null,
    phoneNumber: null,
    customerName: null,
    dob: null,
    customerAddress: null,
    profilePhotoUri: null,
    tempUid: null,
    user: null,

    setName: (name) => set({ customerName: name }),
    setAddress: (address) => set({ customerAddress: address }),
    setProfilePhoto: (uri) => set({ profilePhotoUri: uri }),

    sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
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
            const mockUid = `user_${get().phoneNumber?.replace(/\D/g, '') || Math.random().toString(36).substring(2, 10)}`;
            const userRef = doc(db, 'users', mockUid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const existingData = docSnap.data() as User;
                await AsyncStorage.setItem('nightflame_session', JSON.stringify(existingData));
                set({ isLoading: false, user: existingData, error: null });
                return false; // Not a new user
            } else {
                set({ isLoading: false, tempUid: mockUid, error: null });
                return true; // Is a new user
            }
        } catch (e: any) {
            set({ isLoading: false, error: e.message || 'Verification Error' });
            throw new Error(e.message);
        }
    },

    completeRegistration: async () => {
        const { tempUid, phoneNumber, customerName, customerAddress, profilePhotoUri } = get();
        if (!tempUid) return;

        set({ isLoading: true, error: null });
        try {
            const userRef = doc(db, 'users', tempUid);
            const userData: User = {
                userId: tempUid,
                name: customerName || 'User',
                dob: get().dob || undefined,
                phoneNumber: `+91 ${phoneNumber}`,
                address: customerAddress || '',
                profilePhotoUri: profilePhotoUri || undefined,
                createdAt: Date.now(),
                role: UserRole.CUSTOMER
            };
            await setDoc(userRef, userData);
            await AsyncStorage.setItem('nightflame_session', JSON.stringify(userData));
            set({
                isLoading: false,
                user: userData,
                tempUid: null,
                customerName: null,
                dob: null,
                customerAddress: null,
                profilePhotoUri: null,
                error: null
            });
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
            const adminUser = {
                userId: 'admin-local',
                name: 'Admin',
                phoneNumber: '',
                address: 'Shop Manager',
                createdAt: Date.now(),
                role: UserRole.ADMIN
            };
            await AsyncStorage.setItem('nightflame_session', JSON.stringify(adminUser));
            set({
                isLoading: false,
                user: adminUser,
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
            await AsyncStorage.removeItem('nightflame_session');
            set({ user: null, verificationId: null, isLoading: false, error: null });
        } catch {
            set({ isLoading: false });
        }
    },

    updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        try {
            const updatedUser = { ...user, ...updates };
            const userRef = doc(db, 'users', user.userId);
            await setDoc(userRef, updatedUser, { merge: true });
            set({ user: updatedUser });
        } catch (e: any) {
            console.error('Update profile error:', e);
        }
    },

    checkAuthState: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (docSnap.exists()) {
                        set({ user: docSnap.data() as User });
                    }
                } catch (e) {
                    console.error('Error fetching user data from Firestore', e);
                }
            } else {
                // Only clear if no manual session exists
                const { user } = get();
                if (user && (user.userId === 'admin-local' || user.userId.startsWith('user_'))) {
                    // It's a manual/demo session, keep it
                    return;
                }
                set({ user: null });
            }
        });

        return unsubscribe;
    },

    loadSession: async () => {
        try {
            const session = await AsyncStorage.getItem('nightflame_session');
            if (session) {
                set({ user: JSON.parse(session), isInitializing: false });
            } else {
                set({ isInitializing: false });
            }
        } catch (e) {
            console.error('Session load error', e);
            set({ isInitializing: false });
        }
    }
}));

