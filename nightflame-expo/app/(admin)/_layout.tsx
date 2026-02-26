import { Stack } from 'expo-router';
import { AppColors } from '../../constants/Colors';

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: AppColors.surface,
                },
                headerTintColor: AppColors.textPrimary,
                headerTitleStyle: {
                    fontFamily: 'Poppins_700Bold',
                },
                contentStyle: {
                    backgroundColor: AppColors.background,
                }
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{
                    title: 'Admin Dashboard',
                    headerBackVisible: false, // Don't allow back to login natively
                }}
            />
            <Stack.Screen
                name="menu-form"
                options={{
                    title: 'Manage Item',
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
