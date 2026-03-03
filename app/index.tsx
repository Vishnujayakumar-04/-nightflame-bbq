import { UserRole } from '../constants/enums';
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function IndexScreen() {
    const { user, isLoading, isInitializing } = useAuthStore();

    if (isLoading || isInitializing) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1817' }}>
                <ActivityIndicator size="large" color="#FF6A00" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/welcome" />;
    }

    if (user.role === UserRole.ADMIN) {
        return <Redirect href="/(admin)/dashboard" />;
    }

    return <Redirect href="/(customer)/home" />;
}
