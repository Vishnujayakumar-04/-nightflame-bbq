import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Text, Animated as RNAnimated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { OrderStatus } from '../../constants/enums';

export default function CustomerTabsLayout() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { orders, subscribeToOrders } = useOrderStore();
    const [notification, setNotification] = useState<{ message: string; icon: string; color: string } | null>(null);
    const slideAnim = useRef(new RNAnimated.Value(-150)).current;
    const prevStatusesRef = useRef<Record<string, string>>({});

    // Subscribe to real-time order updates for the customer
    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToOrders();
        return unsub;
    }, [user]);

    // Detect order status changes and show in-app notifications
    useEffect(() => {
        if (!orders.length) return;

        const prevStatuses = prevStatusesRef.current;
        let alertMessage = '';
        let alertIcon = 'notifications-outline';
        let alertColor = '#FF6A00';

        for (const order of orders) {
            const prev = prevStatuses[order.orderId];
            const curr = order.status;

            // Only trigger if we have a previous value (skip initial load)
            if (prev && prev !== curr) {
                if (curr === OrderStatus.PREPARING) {
                    alertMessage = '🍳 Your order is being prepared!';
                    alertIcon = 'restaurant-outline';
                    alertColor = '#FF6A00';
                    break;
                } else if (curr === OrderStatus.READY) {
                    alertMessage = '✅ Your order is ready for pickup!';
                    alertIcon = 'checkmark-circle-outline';
                    alertColor = '#4CAF50';
                    break;
                }
            }
        }

        // Update tracked statuses
        const newStatuses: Record<string, string> = {};
        for (const order of orders) {
            newStatuses[order.orderId] = order.status;
        }
        prevStatusesRef.current = newStatuses;

        if (alertMessage) {
            setNotification({ message: alertMessage, icon: alertIcon, color: alertColor });
            RNAnimated.timing(slideAnim, {
                toValue: insets.top + 10,
                duration: 400,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                RNAnimated.timing(slideAnim, {
                    toValue: -150,
                    duration: 400,
                    useNativeDriver: true,
                }).start(() => setNotification(null));
            }, 4000);
        }
    }, [orders]);

    if (!user) {
        return <Redirect href="/(auth)/welcome" />;
    }

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontFamily: 'Inter_600SemiBold',
                        paddingBottom: Platform.OS === 'android' ? 10 : 0,
                    },
                    tabBarStyle: {
                        backgroundColor: '#121212',
                        height: Platform.OS === 'android' ? 75 + insets.bottom : 88,
                        borderTopWidth: 0,
                        borderTopColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                        paddingBottom: insets.bottom,
                        paddingTop: 10,
                    },
                    tabBarBackground: () => (
                        <View style={{ flex: 1, backgroundColor: '#121212' }} />
                    ),
                    tabBarActiveTintColor: '#F36D25',
                    tabBarInactiveTintColor: '#757575',
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? '#F36D25' : '#757575'} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="menu"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={24} color={focused ? '#F36D25' : '#757575'} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="cart"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={focused ? '#F36D25' : '#757575'} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="orders"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={focused ? '#F36D25' : '#757575'} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? '#F36D25' : '#757575'} />
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
                <Tabs.Screen
                    name="shop-details"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>

            {/* In-App Notification Banner */}
            <RNAnimated.View style={[styles.notificationBanner, { transform: [{ translateY: slideAnim }] }]}>
                <View style={[styles.notificationIcon, { backgroundColor: `${notification?.color || '#FF6A00'}20` }]}>
                    <Ionicons name={(notification?.icon as any) || 'notifications-outline'} size={24} color={notification?.color || '#FF6A00'} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>Order Update</Text>
                    <Text style={styles.notificationText}>{notification?.message}</Text>
                </View>
            </RNAnimated.View>
        </>
    );
}

const styles = StyleSheet.create({
    notificationBanner: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#353030',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        zIndex: 9999,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Urbanist_700Bold' },
    notificationText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Urbanist_400Regular', marginTop: 2 },
});
