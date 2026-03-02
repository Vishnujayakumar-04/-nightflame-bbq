import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();

    // Protection to ensure only admins access these routes
    if (!user || user.role !== 'admin') {
        return <Redirect href="/(auth)/role-selection" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: '#F36D25',
                    bottom: Platform.OS === 'android' ? Math.max(insets.bottom + 10, 20) : 25,
                    left: 20,
                    right: 20,
                    height: 65,
                    borderRadius: 35,
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#F36D25',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    paddingHorizontal: 10,
                },
                tabBarActiveTintColor: '#F36D25',
                tabBarInactiveTintColor: '#FFFFFF',
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="walk-in"
                options={{
                    title: 'New',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={26} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="menu-management"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="menu-form"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    activeIconContainer: {
        backgroundColor: '#FFFFFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        top: -6,
        borderWidth: 1,
        borderColor: 'rgba(243, 109, 37, 0.2)'
    },
    inactiveIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
    }
});
