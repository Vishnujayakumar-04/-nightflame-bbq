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
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                            <Ionicons name={focused ? "heart" : "heart-outline"} size={26} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                            <Ionicons name={focused ? "cart" : "cart-outline"} size={26} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                            <Ionicons name={focused ? "person" : "person-outline"} size={26} color={focused ? '#F36D25' : '#FFFFFF'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: null, // Hide from tab bar but keep accessible
                }}
            />
            <Tabs.Screen
                name="order-confirmation"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="order-tracking"
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
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        top: -6, // Causes it to float slightly up, forming a nice semi-circle pop on Android/iOS
        borderWidth: 1,
        borderColor: 'rgba(243, 109, 37, 0.2)'
    },
    inactiveIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
    }
});
