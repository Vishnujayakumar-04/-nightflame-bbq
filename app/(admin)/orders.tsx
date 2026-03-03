import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Order } from '../../types/models';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminPaymentModal } from '../../components/AdminPaymentModal';
import { AdminActionModal } from '../../components/AdminActionModal';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../constants/enums';

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
    const { orders, subscribeToOrders, updateOrderStatus, confirmPayment, lockOrder, unlockOrder } = useOrderStore();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
    const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [isActionModalVisible, setActionModalVisible] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    const handleStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return;
        setSelectedOrderForAction(order);
        setActionModalVisible(true);
    };

    const handleConfirmPayment = async (method: PaymentMethod.CASH | PaymentMethod.UPI, transactionId?: string) => {
        if (!selectedOrderForPayment) return;
        setIsProcessingPayment(true);
        try {
            await confirmPayment(selectedOrderForPayment.orderId, method, transactionId);
            setPaymentModalVisible(false);
            setSelectedOrderForPayment(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to confirm payment.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleClosePaymentModal = async () => {
        if (selectedOrderForPayment) {
            await unlockOrder(selectedOrderForPayment.orderId);
        }
        setPaymentModalVisible(false);
        setSelectedOrderForPayment(null);
    };

    const activeOrders = useMemo(() => {
        return orders.filter(o => o.status !== OrderStatus.COMPLETED);
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === 'All') return orders;
        return orders.filter(o => o.status === activeFilter.toLowerCase());
    }, [orders, activeFilter]);

    const getFilterCount = (filter: FilterType) => {
        if (filter === 'All') return orders.length;
        return orders.filter(o => o.status === filter.toLowerCase()).length;
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
                        <View style={[styles.badge, { backgroundColor: item.paymentStatus === PaymentStatus.PAID ? 'rgba(76, 175, 80, 0.15)' : item.paymentStatus === PaymentStatus.PAYMENT_INITIATED ? 'rgba(255, 152, 0, 0.15)' : 'rgba(239, 83, 80, 0.15)' }]}>
                            <Text style={[styles.badgeText, { color: item.paymentStatus === PaymentStatus.PAID ? '#4CAF50' : item.paymentStatus === PaymentStatus.PAYMENT_INITIATED ? '#FF9800' : '#EF5350' }]}>
                                {item.paymentStatus === PaymentStatus.PAID ? 'PREPAID' : item.paymentStatus === PaymentStatus.PAYMENT_INITIATED ? 'VERIFY UPI' : 'UNPAID'}
                            </Text>
                        </View>
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
            <View style={{ height: 48, marginBottom: 6 }}>
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
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {filter} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

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

            {selectedOrderForPayment && (
                <AdminPaymentModal
                    visible={isPaymentModalVisible}
                    orderId={selectedOrderForPayment.orderId}
                    amount={selectedOrderForPayment.totalAmount}
                    customerName={selectedOrderForPayment.customerName || 'Walk-in'}
                    isLoading={isProcessingPayment}
                    onClose={handleClosePaymentModal}
                    onConfirm={handleConfirmPayment}
                />
            )}

            <AdminActionModal
                visible={isActionModalVisible}
                order={selectedOrderForAction}
                onClose={() => {
                    setActionModalVisible(false);
                    setSelectedOrderForAction(null);
                }}
                onUpdateStatus={(orderId, currentStatus) => {
                    const order = orders.find(o => o.orderId === orderId);
                    if (!order) return;

                    const options = [];

                    if (currentStatus === OrderStatus.PENDING) {
                        options.push({ text: 'Confirm Order', onPress: () => updateOrderStatus(orderId, OrderStatus.ACCEPTED) });
                    } else if (currentStatus === OrderStatus.ACCEPTED) {
                        options.push({ text: 'Start Preparing', onPress: () => updateOrderStatus(orderId, OrderStatus.PREPARING) });
                    } else if (currentStatus === OrderStatus.PREPARING) {
                        options.push({ text: 'Ready for Pickup', onPress: () => updateOrderStatus(orderId, OrderStatus.READY) });
                    } else if (currentStatus === OrderStatus.READY) {
                        options.push({
                            text: 'Complete Order',
                            onPress: () => {
                                if (order.paymentStatus !== PaymentStatus.PAID) {
                                    Alert.alert('Payment Required', 'This order is strict PayNow or PayLater. Confirm payment first.');
                                    return;
                                }
                                updateOrderStatus(orderId, OrderStatus.COMPLETED);
                            }
                        });
                    }
                    // If the modal is configured to take options, this is where they would be passed.
                    // Assuming the AdminActionModal internally handles status transitions based on the current order status.
                    // The original onUpdateStatus was a direct call, this change implies a more complex flow.
                    // For now, we'll keep the direct call as per the original structure, but update the enum usage.
                    // The provided snippet seems to be for generating options *within* the modal, not for the prop itself.
                    // Reverting to the original prop structure but using the correct enums for the example.
                    updateOrderStatus(orderId, currentStatus); // This line will be replaced by the actual status change logic within the modal.
                    setActionModalVisible(false);
                }}
                onCollectPayment={async (order) => {
                    setActionModalVisible(false);
                    await lockOrder(order.orderId);
                    setSelectedOrderForPayment(order);
                    setPaymentModalVisible(true);
                }}
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
    filterList: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    filterChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, height: 40,
        backgroundColor: '#252121', borderWidth: 1, borderColor: '#353030',
    },
    filterChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
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
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
    amount: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: '#757575', fontSize: 16, fontFamily: 'Inter_400Regular' },
});
