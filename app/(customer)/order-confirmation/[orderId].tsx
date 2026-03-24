import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';

import { useState, useEffect } from 'react';
import { useOrderStore } from '../../../store/orderStore';
import { Order } from '../../../types/models';

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { orders, subscribeToOrders } = useOrderStore();
    const [order, setOrder] = useState<Order | null>(null);

    // Ensure orders are loaded
    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    useEffect(() => {
        if (orderId) {
            const found = orders.find(o => o.orderId === orderId);
            if (found) setOrder(found);
        }
    }, [orderId, orders]);

    const displayId = order?.orderNumber || (orderId ? `#NF-${orderId.substring(0, 4).toUpperCase()}` : 'LOADING...');

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>

                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark" size={48} color="#4CAF50" />
                </View>

                <Text style={styles.title}>Order Confirmed!</Text>
                <Text style={styles.subtitle}>Your delicious BBQ is being prepared.</Text>

                {/* Order ID Card */}
                <View style={styles.orderIdCard}>
                    <Text style={styles.orderIdLabel}>ORDER ID</Text>
                    <Text style={styles.orderIdValue}>{displayId}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => router.replace(`/(customer)/order-tracking/${orderId}`)}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.btnGradient}
                        >
                            <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.btnText}>Track Order</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.replace('/(customer)/home')}
                    >
                        <Text style={styles.backBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    iconContainer: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2, borderColor: 'rgba(76, 175, 80, 0.3)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
    },
    title: { color: '#FFFFFF', fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: 8, textAlign: 'center' },
    subtitle: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 32 },
    orderIdCard: {
        backgroundColor: '#252121', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 32,
        alignItems: 'center', borderWidth: 1, borderColor: '#353030', width: '100%', marginBottom: 40,
    },
    orderIdLabel: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 2, marginBottom: 8 },
    orderIdValue: { color: '#FF6A00', fontSize: 28, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
    actionsContainer: { width: '100%', gap: 16 },
    trackBtn: { borderRadius: 14, overflow: 'hidden' },
    btnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 18, borderRadius: 14,
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    backBtn: {
        alignItems: 'center', justifyContent: 'center', paddingVertical: 18,
        borderRadius: 14, borderWidth: 1, borderColor: '#353030', backgroundColor: '#252121',
    },
    backBtnText: { color: '#A5A2A2', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
