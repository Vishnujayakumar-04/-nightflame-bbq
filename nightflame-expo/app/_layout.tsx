import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";
import "./global.css";
import { useAuthStore } from "../store/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        Poppins_700Bold,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    useEffect(() => {
        const unsubscribe = useAuthStore.getState().checkAuthState();
        return () => unsubscribe();
    }, []);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
            {/* Auth Screens */}
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />

            {/* Customer Tab Group */}
            <Stack.Screen name="(customer)" />

            {/* Admin Group */}
            <Stack.Screen name="(admin)" />
        </Stack>
    );
}
