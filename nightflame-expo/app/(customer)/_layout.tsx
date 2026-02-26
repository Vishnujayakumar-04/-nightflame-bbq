import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/Colors';
import { AppStrings } from '../../constants/Strings';

export default function CustomerTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: AppColors.surface,
                    borderTopColor: AppColors.divider,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: AppColors.flameOrange,
                tabBarInactiveTintColor: AppColors.textMuted,
                tabBarLabelStyle: {
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: AppStrings.menu,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="restaurant-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: AppStrings.cart,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: AppStrings.myOrders,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
