import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useOrderStore } from '../../store/orderStore';
import { PaymentStatus, PaymentMethod } from '../../constants/enums';
import { Order } from '../../types/models';
import { AdminPaymentModal } from '../../components/AdminPaymentModal';

const { width } = Dimensions.get('window');
const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatOrderId = (id: string) => `#${id.slice(-5).toUpperCase()}`;
const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

type TabType = 'qr' | 'history';
type FilterType = 'All' | 'Paid' | 'Unpaid';

export default function PaymentQRScreen() {
    const { orders, subscribeToOrders, confirmPayment, lockOrder, unlockOrder } = useOrderStore();
    const [activeTab, setActiveTab] = useState<TabType>('qr');
    const [filter, setFilter] = useState<FilterType>('All');

    // Payment modal state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    // Today's orders sorted by timestamp desc
    const todayOrders = useMemo(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return orders.filter(o => o.timestamp >= startOfToday.getTime());
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (filter === 'All') return todayOrders;
        if (filter === 'Paid') return todayOrders.filter(o => o.paymentStatus === PaymentStatus.PAID);
        return todayOrders.filter(o => o.paymentStatus !== PaymentStatus.PAID);
    }, [todayOrders, filter]);

    const paidCount = todayOrders.filter(o => o.paymentStatus === PaymentStatus.PAID).length;
    const unpaidCount = todayOrders.filter(o => o.paymentStatus !== PaymentStatus.PAID).length;
    const paidTotal = todayOrders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((s, o) => s + o.totalAmount, 0);

    const handleCollectPayment = async (order: Order) => {
        await lockOrder(order.orderId);
        setSelectedOrder(order);
        setPaymentModalVisible(true);
    };

    const handleConfirmPayment = async (method: PaymentMethod.CASH | PaymentMethod.UPI, transactionId?: string) => {
        if (!selectedOrder) return;
        setIsProcessing(true);
        try {
            await confirmPayment(selectedOrder.orderId, method, transactionId);
            setPaymentModalVisible(false);
            setSelectedOrder(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to confirm payment.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClosePaymentModal = async () => {
        if (selectedOrder) {
            await unlockOrder(selectedOrder.orderId);
        }
        setPaymentModalVisible(false);
        setSelectedOrder(null);
    };

    const getPaymentBadge = (order: Order) => {
        if (order.paymentStatus === PaymentStatus.PAID) {
            return {
                text: order.paymentMethod === PaymentMethod.UPI ? 'UPI' : 'CASH',
                bg: 'rgba(76, 175, 80, 0.12)',
                color: '#4CAF50',
            };
        }
        if (order.paymentStatus === PaymentStatus.PAYMENT_INITIATED) {
            return { text: 'VERIFYING', bg: 'rgba(255, 152, 0, 0.12)', color: '#FF9800' };
        }
        return { text: 'UNPAID', bg: 'rgba(239, 83, 80, 0.12)', color: '#EF5350' };
    };

    const renderOrderRow = ({ item, index }: { item: Order; index: number }) => {
        const badge = getPaymentBadge(item);
        const itemsSummary = item.items.map(i => `${i.menuItem.name} ×${i.quantity}`).join(', ');
        const isPaid = item.paymentStatus === PaymentStatus.PAID;

        return (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
                <View style={styles.orderRow}>
                    {/* Top: Order ID, Name, Amount */}
                    <View style={styles.orderRowTop}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                <Text style={styles.orderId}>{formatOrderId(item.orderId)}</Text>
                                <Text style={styles.orderName}>{item.customerName || 'Customer'}</Text>
                            </View>
                            <Text style={styles.orderItems} numberOfLines={1}>{itemsSummary}</Text>
                        </View>
                        <Text style={styles.orderAmount}>{formatCurrency(item.totalAmount)}</Text>
                    </View>

                    {/* Bottom: Payment badge, transaction ID, time, action */}
                    <View style={styles.orderRowBottom}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <View style={[styles.payBadge, { backgroundColor: badge.bg }]}>
                                <Text style={[styles.payBadgeText, { color: badge.color }]}>{badge.text}</Text>
                            </View>
                            {item.transactionId && (
                                <Text style={styles.txnId} numberOfLines={1}>TXN: {item.transactionId}</Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.orderTime}>{formatTime(item.timestamp)}</Text>
                            {!isPaid && (
                                <TouchableOpacity
                                    style={styles.collectBtn}
                                    onPress={() => handleCollectPayment(item)}
                                >
                                    <Text style={styles.collectBtnText}>Collect</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Payments</Text>
                <Text style={styles.subtitle}>QR Code & Payment History</Text>
            </View>

            {/* Tab Toggle: QR / History */}
            <View style={styles.tabToggle}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'qr' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('qr')}
                >
                    <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History ({paidCount})</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'qr' ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                    {/* QR Card */}
                    <View style={styles.qrCard}>
                        <View style={styles.qrImageWrapper}>
                            <Image
                                source={require('../../assets/Payment/IMG_20260305_105900.png')}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="scan-outline" size={16} color="#FF6A00" />
                            <Text style={styles.infoText}>Customer scans this QR to pay via any UPI app</Text>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.quickStats}>
                        <View style={[styles.quickStatCard, { borderColor: '#4CAF50' }]}>
                            <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>{formatCurrency(paidTotal)}</Text>
                            <Text style={styles.quickStatLabel}>Collected Today</Text>
                        </View>
                        <View style={[styles.quickStatCard, { borderColor: '#FF6A00' }]}>
                            <Text style={[styles.quickStatValue, { color: '#FF6A00' }]}>{paidCount}</Text>
                            <Text style={styles.quickStatLabel}>Paid</Text>
                        </View>
                        <View style={[styles.quickStatCard, { borderColor: '#EF5350' }]}>
                            <Text style={[styles.quickStatValue, { color: '#EF5350' }]}>{unpaidCount}</Text>
                            <Text style={styles.quickStatLabel}>Unpaid</Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Filter chips */}
                    <View style={{ height: 44, marginBottom: 4 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                            {(['All', 'Paid', 'Unpaid'] as FilterType[]).map(f => {
                                const count = f === 'All' ? todayOrders.length : f === 'Paid' ? paidCount : unpaidCount;
                                const isActive = filter === f;
                                return (
                                    <TouchableOpacity
                                        key={f}
                                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                                        onPress={() => setFilter(f)}
                                    >
                                        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                            {f} ({count})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Payment History List */}
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={item => item.orderId}
                        renderItem={renderOrderRow}
                        contentContainerStyle={{ paddingBottom: 140 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={40} color="#353030" />
                                <Text style={styles.emptyText}>No orders found</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Payment Modal */}
            {selectedOrder && (
                <AdminPaymentModal
                    visible={isPaymentModalVisible}
                    orderId={selectedOrder.orderId}
                    amount={selectedOrder.totalAmount}
                    customerName={selectedOrder.customerName || 'Customer'}
                    isLoading={isProcessing}
                    onClose={handleClosePaymentModal}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
    title: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    subtitle: { color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

    // Tab Toggle
    tabToggle: {
        flexDirection: 'row', marginHorizontal: 16, marginTop: 10, marginBottom: 12,
        backgroundColor: '#252121', borderRadius: 12, padding: 3,
    },
    tabBtn: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10,
    },
    tabBtnActive: { backgroundColor: '#FF6A00' },
    tabText: { color: '#757575', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    tabTextActive: { color: '#FFFFFF' },

    // QR Card
    qrCard: {
        backgroundColor: '#252121', marginHorizontal: 16, borderRadius: 16,
        padding: 16, borderWidth: 1, borderColor: '#353030', alignItems: 'center',
    },
    qrImageWrapper: {
        backgroundColor: '#FFFFFF', borderRadius: 14, padding: 8, marginBottom: 14,
        width: width - 40, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    },
    qrImage: { width: '100%', height: '100%', borderRadius: 6 },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255, 106, 0, 0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    },
    infoText: { color: '#A5A2A2', fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },

    // Quick Stats
    quickStats: {
        flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 14,
    },
    quickStatCard: {
        flex: 1, backgroundColor: '#252121', borderRadius: 12, padding: 12,
        alignItems: 'center', borderWidth: 1, borderColor: '#353030', borderLeftWidth: 3,
    },
    quickStatValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
    quickStatLabel: { color: '#757575', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 3 },

    // Filter Chips
    filterRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, height: 38,
        backgroundColor: '#252121', borderWidth: 1, borderColor: '#353030',
    },
    filterChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
    filterText: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    filterTextActive: { color: '#FFFFFF' },

    // Order Rows
    orderRow: {
        backgroundColor: '#252121', marginHorizontal: 16, marginBottom: 8,
        borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#353030',
    },
    orderRowTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8,
    },
    orderId: { color: '#FF6A00', fontSize: 13, fontFamily: 'Inter_700Bold' },
    orderName: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    orderItems: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular' },
    orderAmount: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    orderRowBottom: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#353030', paddingTop: 8,
    },
    payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    payBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
    txnId: { color: '#757575', fontSize: 10, fontFamily: 'Inter_400Regular', maxWidth: 100 },
    orderTime: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular' },
    collectBtn: {
        backgroundColor: '#FF6A00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    },
    collectBtnText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_700Bold' },

    // Empty
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: '#757575', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 10 },
});
