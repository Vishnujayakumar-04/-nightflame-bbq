import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Text, Animated as RNAnimated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useEffect, useState, useRef } from 'react';
import { PaymentStatus, UserRole, OrderStatus } from '../../constants/enums';

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { orders, updateOrderPayment } = useOrderStore();
    const [notification, setNotification] = useState<{ id: string, message: string, title: string, icon: string, color: string } | null>(null);
    const slideAnim = useRef(new RNAnimated.Value(-150)).current;
    const notifiedOrderIds = useRef<Set<string>>(new Set());

    const showBanner = (data: { id: string, message: string, title: string, icon: string, color: string }) => {
        setNotification(data);
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
    };

    useEffect(() => {
        // Check for payment confirmation
        const newPaidOrder = orders.find(o => o.paymentStatus === PaymentStatus.PAID && !o.notificationShown);
        if (newPaidOrder) {
            updateOrderPayment(newPaidOrder.orderId, { notificationShown: true });
            showBanner({
                id: newPaidOrder.orderId,
                message: `Payment Confirmed! ₹${newPaidOrder.totalAmount} received via ${newPaidOrder.paymentMethod}.`,
                title: 'Payment Received',
                icon: 'checkmark-circle',
                color: '#4CAF50',
            });
            return;
        }

        // Check for new online orders (PENDING that we haven't notified about)
        const newPendingOrder = orders.find(o => o.status === OrderStatus.PENDING && !notifiedOrderIds.current.has(o.orderId));
        if (newPendingOrder && notifiedOrderIds.current.size > 0) {
            // Only show notification after initial load (size > 0 means we've seen orders before)
            notifiedOrderIds.current.add(newPendingOrder.orderId);
            showBanner({
                id: newPendingOrder.orderId,
                message: `New order #${newPendingOrder.orderId.substring(0, 6).toUpperCase()} — ₹${newPendingOrder.totalAmount}`,
                title: '🔔 New Order!',
                icon: 'receipt',
                color: '#FF6A00',
            });
            return;
        }

        // Track all current order IDs on initial load
        if (notifiedOrderIds.current.size === 0 && orders.length > 0) {
            orders.forEach(o => notifiedOrderIds.current.add(o.orderId));
        }
    }, [orders]);

    // Protection to ensure only admins access these routes
    if (!user || user.role !== UserRole.ADMIN) {
        return <Redirect href="/(auth)/role-selection" />;
    }

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        height: Platform.OS === 'android' ? 75 + insets.bottom : 95,
                        backgroundColor: '#121212',
                        borderTopWidth: 0,
                        paddingBottom: insets.bottom,
                        paddingTop: 8,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderTopColor: 'transparent',
                    },
                    tabBarActiveTintColor: '#F36D25',
                    tabBarInactiveTintColor: '#757575',
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontFamily: 'Urbanist_600SemiBold',
                        marginTop: -2,
                        paddingBottom: Platform.OS === 'android' ? 10 : 0,
                    },
                }}
            >
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="orders"
                    options={{
                        title: 'Orders',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="walk-in"
                    options={{
                        title: 'New',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="menu-management"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="payment-qr"
                    options={{
                        title: 'Pay',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 22, fontWeight: '900', color }}>₹</Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
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

            {/* Notification Banner Overlay */}
            <RNAnimated.View style={[styles.notificationBanner, { transform: [{ translateY: slideAnim }] }]}>
                <View style={[styles.notificationIcon, { backgroundColor: `${notification?.color || '#4CAF50'}20` }]}>
                    <Ionicons name={(notification?.icon as any) || 'checkmark-circle'} size={24} color={notification?.color || '#4CAF50'} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{notification?.title || 'Notification'}</Text>
                    <Text style={styles.notificationText}>{notification?.message}</Text>
                </View>
            </RNAnimated.View>
        </>
    );
}

const styles = StyleSheet.create({
    activeIconContainer: {
        backgroundColor: '#FFFFFF',
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        top: -3,
        borderWidth: 1,
        borderColor: 'rgba(243, 109, 37, 0.2)'
    },
    inactiveIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
    },
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
        zIndex: 9999
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Urbanist_700Bold' },
    notificationText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Urbanist_400Regular', marginTop: 2 },
});
