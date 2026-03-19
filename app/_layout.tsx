import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import {
    useFonts,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold
} from "@expo-google-fonts/urbanist";
import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";
import { useAuthStore } from "../store/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        Urbanist_400Regular,
        Urbanist_500Medium,
        Urbanist_600SemiBold,
        Urbanist_700Bold,
        Urbanist_800ExtraBold,
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });


    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    useEffect(() => {
        const store = useAuthStore.getState();
        store.loadSession();
        const unsubscribe = store.checkAuthState();
        return () => unsubscribe();
    }, []);

    if (!loaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
                {/* Auth Screens */}
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />

                {/* Customer Tab Group */}
                <Stack.Screen name="(customer)" />

                {/* Admin Group */}
                <Stack.Screen name="(admin)" />
            </Stack>
        </GestureHandlerRootView>
    );
}
