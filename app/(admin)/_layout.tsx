import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Text, Animated as RNAnimated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useEffect, useState, useRef } from 'react';
import { PaymentStatus, UserRole } from '../../constants/enums';

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { orders, updateOrderPayment } = useOrderStore();
    const [notification, setNotification] = useState<{ id: string, message: string } | null>(null);
    const slideAnim = useRef(new RNAnimated.Value(-150)).current;

    useEffect(() => {
        // Find an order that was just paid but notification is not shown
        const newPaidOrder = orders.find(o => o.paymentStatus === PaymentStatus.PAID && !o.notificationShown);
        if (newPaidOrder) {
            // Update immediately so it doesn't trigger repeatedly
            updateOrderPayment(newPaidOrder.orderId, { notificationShown: true });

            setNotification({
                id: newPaidOrder.orderId,
                message: `Payment Confirmed! ₹${newPaidOrder.totalAmount} received via ${newPaidOrder.paymentMethod}.`
            });

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

    // Protection to ensure only admins access these routes
    if (!user || user.role !== UserRole.ADMIN) {
        return <Redirect href="/(auth)/role-selection" />;
    }

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        position: 'absolute',
                        backgroundColor: '#F36D25',
                        bottom: Platform.OS === 'android' ? Math.max(insets.bottom + 8, 16) : 20,
                        left: 12,
                        right: 12,
                        height: 56,
                        borderRadius: 28,
                        borderTopWidth: 0,
                        elevation: 8,
                        shadowColor: '#F36D25',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        paddingHorizontal: 4,
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
                                <Ionicons name={focused ? "grid" : "grid-outline"} size={18} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                                <Ionicons name={focused ? "receipt" : "receipt-outline"} size={18} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                                <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={20} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                                <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={18} color={focused ? '#F36D25' : '#FFFFFF'} />
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
                                <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={18} color={focused ? '#F36D25' : '#FFFFFF'} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="payment-qr"
                    options={{
                        title: 'Pay',
                        tabBarIcon: ({ focused }) => (
                            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: focused ? '#F36D25' : '#FFFFFF' }}>₹</Text>
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

            {/* Notification Banner Overlay */}
            <RNAnimated.View style={[styles.notificationBanner, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.notificationIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>New Payment</Text>
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
    notificationTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
    notificationText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
