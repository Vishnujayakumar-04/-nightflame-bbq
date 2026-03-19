import { initializeApp } from 'firebase/app';
// @ts-expect-error — getReactNativePersistence is untyped in the firebase/auth package types
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyBcWWL3TFYHHtSU14ZozUzegmEtJd_Kx3w",
    authDomain: "nightflame-bbq.firebaseapp.com",
    projectId: "nightflame-bbq",
    storageBucket: "nightflame-bbq.firebasestorage.app",
    messagingSenderId: "170377175269",
    appId: "1:170377175269:android:80c7e0776b913dde75f40c"
};

const app = initializeApp(firebaseConfig);

// Using getReactNativePersistence from firebase/auth for AsyncStorage persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

