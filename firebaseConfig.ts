import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBcWWL3TFYHHtSU14ZozUzegmEtJd_Kx3w",
    authDomain: "nightflame-bbq.firebaseapp.com",
    projectId: "nightflame-bbq",
    storageBucket: "nightflame-bbq.firebasestorage.app",
    messagingSenderId: "170377175269",
    appId: "1:170377175269:android:80c7e0776b913dde75f40c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
