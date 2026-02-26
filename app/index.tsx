import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { AppColors } from "../constants/Colors";

export default function IndexScreen() {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color={AppColors.flameOrange} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/welcome" />;
    }

    if (user.role === 'admin') {
        return <Redirect href="/(admin)/dashboard" />;
    }

    return <Redirect href="/(customer)/home" />;
}
