import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Order, OrderStatus } from '../../types/models';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge } from '../../components/ui/StatusBadge';

const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatOrderIdShort = (id: string) => `#NF-${id.substring(0, 3).toUpperCase()}`;
const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
};

const FILTERS = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'] as const;
type FilterType = typeof FILTERS[number];

export default function AdminOrdersScreen() {
    const { orders, subscribeToOrders } = useOrderStore();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    const { updateOrderStatus } = useOrderStore();

    const handleStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
        const statuses: { label: string, status: OrderStatus }[] = [
            { label: 'Pending', status: OrderStatus.pending },
            { label: 'Start Preparing', status: OrderStatus.preparing },
            { label: 'Ready for Pickup', status: OrderStatus.ready },
            { label: 'Complete Order', status: OrderStatus.completed },
        ];

        Alert.alert(
            'Update Status',
            'Move order to next stage:',
            [
                ...statuses.map(s => ({
                    text: s.label,
                    onPress: () => updateOrderStatus(orderId, s.status)
                })),
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const activeOrders = useMemo(() => {
        return orders.filter(o => o.status !== OrderStatus.completed);
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === 'All') return orders;
        return orders.filter(o => o.status === activeFilter.toLowerCase());
    }, [orders, activeFilter]);

    const getFilterCount = (filter: FilterType) => {
        if (filter === 'All') return orders.length;
        return orders.filter(o => o.status === filter.toLowerCase()).length;
    };

    const getFilterEmoji = (filter: FilterType) => {
        const map: Record<string, string> = {
            'All': '', 'Pending': '⏳', 'Confirmed': '✅', 'Preparing': '🔥', 'Ready': '🍽️', 'Completed': '✔️'
        };
        return map[filter] || '';
    };

    const renderOrderCard = ({ item, index }: { item: Order, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.85}
                onPress={() => handleStatusUpdate(item.orderId, item.status)}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.orderId}>{formatOrderIdShort(item.orderId)}</Text>
                        {!item.userId && (
                            <View style={styles.walkInTag}>
                                <Text style={styles.walkInTagText}>Walk-in</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={item.status} />
                        <Ionicons name="chevron-forward" size={16} color="#757575" />
                    </View>
                </View>

                <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
                <Text style={styles.itemsList} numberOfLines={1}>
                    {item.items.map(i => `${i.menuItem.name} ×${i.quantity}`).join(', ')}
                </Text>

                <View style={styles.cardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time-outline" size={12} color="#757575" />
                        <Text style={styles.timeText}>{getRelativeTime(item.timestamp)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.paymentTag, { color: item.paymentStatus === 'Paid' ? '#4CAF50' : '#EF5350' }]}>
                            {item.paymentMethod} · {item.paymentStatus}
                        </Text>
                        <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Live Orders</Text>
                <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>{activeOrders.length} active</Text>
                </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
            >
                {FILTERS.map(filter => {
                    const count = getFilterCount(filter);
                    const isActive = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            {getFilterEmoji(filter) ? <Text style={styles.filterEmoji}>{getFilterEmoji(filter)}</Text> : null}
                            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                {filter} ({count})
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.orderId}
                renderItem={renderOrderCard}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={48} color="#555" />
                        <Text style={styles.emptyText}>No orders found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14,
    },
    title: { color: '#FFFFFF', fontSize: 26, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    activeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(76, 175, 80, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
    activeText: { color: '#4CAF50', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    filterList: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#252121', borderWidth: 1, borderColor: '#353030',
    },
    filterChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
    filterEmoji: { fontSize: 12 },
    filterText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    filterTextActive: { color: '#FFFFFF' },
    orderCard: {
        backgroundColor: '#252121', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#353030',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    orderId: { color: '#FF6A00', fontSize: 15, fontFamily: 'Inter_700Bold' },
    walkInTag: {
        backgroundColor: 'rgba(255, 193, 7, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    walkInTagText: { color: '#FFC107', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
    customerName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
    itemsList: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timeText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular' },
    paymentTag: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
    amount: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: '#757575', fontSize: 16, fontFamily: 'Inter_400Regular' },
});
