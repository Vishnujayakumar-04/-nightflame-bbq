import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Order } from '../../types/models';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useOrderStore } from '../../store/orderStore';
import { OrderStatus, PaymentStatus } from '../../constants/enums';

const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function MyOrdersScreen() {
    const router = useRouter();
    const { orders, isLoading } = useOrderStore();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const activeOrders = useMemo(() => {
        return orders.filter(o => o.status !== OrderStatus.COMPLETED);
    }, [orders]);

    const pastOrders = useMemo(() => {
        return orders.filter(o => o.status === OrderStatus.COMPLETED);
    }, [orders]);

    const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

    const renderEmptyState = () => (
        <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#757575" />
            <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'No active orders' : 'No past orders'}
            </Text>
            <TouchableOpacity
                style={styles.orderNowBtn}
                onPress={() => router.push('/(customer)/menu')}
            >
                <LinearGradient
                    colors={['#FF6A00', '#E53B0A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.orderNowGradient}
                >
                    <Text style={styles.orderNowText}>Order Now</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderOrderItem = ({ item, index }: { item: Order, index: number }) => {
        const itemsSummary = item.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ');

        return (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
                <TouchableOpacity
                    onPress={() => router.push(`/(customer)/order-tracking/${item.orderId}`)}
                    style={styles.orderCard}
                    activeOpacity={0.85}
                >
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>{formatOrderIdShort(item.orderId)}</Text>
                        <StatusBadge status={item.status} />
                    </View>

                    <Text style={styles.orderItems} numberOfLines={2}>{itemsSummary}</Text>

                    <View style={styles.orderFooter}>
                        <View style={styles.orderMeta}>
                            <Ionicons name="time-outline" size={14} color="#757575" />
                            <Text style={styles.orderMetaText}>{formatTime(item.pickupTime)}</Text>
                            <Text style={styles.orderMetaText}>{formatDate(item.timestamp)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.orderTotal}>{formatCurrency(item.totalAmount)}</Text>
                            {item.paymentStatus && (
                                <Text style={[
                                    styles.paymentBadge,
                                    { color: item.paymentStatus === PaymentStatus.PAID ? '#4CAF50' : '#EF5350' }
                                ]}>
                                    {item.paymentStatus}
                                </Text>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <LinearGradient colors={['#1A1818', '#1D1510']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My Orders</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.tabActive]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                            Active ({activeOrders.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'past' && styles.tabActive]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
                            Past ({pastOrders.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF6A00" />
                    </View>
                ) : true || displayOrders.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={displayOrders}
                        keyExtractor={(item) => item.orderId}
                        renderItem={renderOrderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontFamily: 'Poppins_700Bold',
        fontStyle: 'italic',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#252121',
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#FF6A00',
    },
    tabText: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 16,
        marginBottom: 20,
    },
    orderNowBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    orderNowGradient: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
    },
    orderNowText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderCard: {
        backgroundColor: '#252121',
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#353030',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderId: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    orderItems: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        marginBottom: 14,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(53, 48, 48, 0.5)',
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderMetaText: {
        color: '#A5A2A2',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    orderTotal: {
        color: '#FF6A00',
        fontSize: 17,
        fontFamily: 'Inter_700Bold',
    },
    paymentBadge: {
        fontSize: 10,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 2,
    },
});
