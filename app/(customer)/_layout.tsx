import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function CustomerTabsLayout() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();

    if (!user) {
        return <Redirect href="/(auth)/welcome" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: '#F36D25',
                    bottom: Platform.OS === 'android' ? 12 : 30,
                    marginHorizontal: 12, // More horizontal space
                    height: 60, // Slightly shorter
                    borderRadius: 30,
                    borderTopWidth: 0,
                    elevation: 12, // Higher elevation
                    shadowColor: '#F36D25',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    paddingBottom: 0,
                },
                tabBarActiveTintColor: '#F36D25',
                tabBarInactiveTintColor: '#FFFFFF',
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
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
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "cart" : "cart-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="order-confirmation/[orderId]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="order-tracking/[orderId]"
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
        width: 44, // Slightly wider
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        top: -4,
        borderWidth: 1,
        borderColor: 'rgba(243, 109, 37, 0.2)'
    },
    inactiveIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    }
});
