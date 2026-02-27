import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { useOrderStore } from '../../store/orderStore';
import { useMenuStore } from '../../store/menuStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { OrderStatus } from '../../types/models';

const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatOrderIdShort = (id: string) => `#NF-${id.substring(0, 3).toUpperCase()}`;
const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
};

export default function AdminDashboardScreen() {
    const router = useRouter();
    const { orders, subscribeToOrders } = useOrderStore();
    const { subscribeToMenu } = useMenuStore();

    useEffect(() => {
        const unsubOrders = subscribeToOrders();
        const unsubMenu = subscribeToMenu();
        return () => { unsubOrders(); unsubMenu(); };
    }, []);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayOrders = orders.filter(o => o.timestamp >= startOfToday);
    const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrders = todayOrders.filter(o => o.status !== OrderStatus.completed);

    // Live queue counts
    const pendingCount = todayOrders.filter(o => o.status === OrderStatus.pending).length;
    const preparingCount = todayOrders.filter(o => o.status === OrderStatus.preparing).length;
    const readyCount = todayOrders.filter(o => o.status === OrderStatus.ready).length;
    const confirmedCount = todayOrders.filter(o => o.status !== OrderStatus.pending && o.status !== OrderStatus.completed).length - preparingCount - readyCount;

    const recentOrders = [...todayOrders].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    const handleLogout = () => {
        Alert.alert('Logout', 'Sign out of admin?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(auth)/welcome') }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={18} color="#FF6A00" />
                        </View>
                        <View>
                            <Text style={styles.adminLabel}>Admin Panel</Text>
                            <Text style={styles.adminName}>Admin User</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={18} color="#A5A2A2" />
                        <Text style={styles.logoutText}>Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Revenue & Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.revenueCard}>
                        <Text style={styles.revenueLabel}>₹</Text>
                        <Text style={styles.revenueAmount}>{formatCurrency(todayRevenue)}</Text>
                        <Text style={styles.revenueSubLabel}>Today's Revenue</Text>
                    </View>
                    <View style={styles.statsColumn}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{todayOrders.length}</Text>
                            <Text style={styles.statBoxLabel}>Orders Today</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{activeOrders.length}</Text>
                            <Text style={styles.statBoxLabel}>Active Now</Text>
                        </View>
                    </View>
                </View>

                {/* LIVE QUEUE */}
                <Text style={styles.sectionLabel}>LIVE QUEUE</Text>
                <View style={styles.queueRow}>
                    {[
                        { label: 'Pending', count: pendingCount, color: '#FFD700' },
                        { label: 'Confirmed', count: confirmedCount, color: '#4CAF50' },
                        { label: 'Preparing', count: preparingCount, color: '#FF6A00' },
                        { label: 'Ready', count: readyCount, color: '#2196F3' },
                    ].map((item) => (
                        <View key={item.label} style={[styles.queueItem, { borderColor: item.color }]}>
                            <Text style={[styles.queueCount, { color: item.color }]}>{item.count}</Text>
                            <Text style={styles.queueLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.walkInBtn}
                        onPress={() => router.push('/(admin)/walk-in')}
                    >
                        <Ionicons name="people-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.walkInText}>Walk-in Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.analyticsBtn}
                        onPress={() => router.push('/(admin)/analytics')}
                    >
                        <Ionicons name="trending-up" size={18} color="#FFFFFF" />
                        <Text style={styles.analyticsText}>Analytics</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Orders */}
                <View style={styles.recentHeader}>
                    <Text style={styles.sectionLabel}>RECENT ORDERS</Text>
                    <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                {recentOrders.map(order => (
                    <TouchableOpacity key={order.orderId} style={styles.orderCard} activeOpacity={0.85}>
                        <View style={styles.orderCardHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.orderIdText}>{formatOrderIdShort(order.orderId)}</Text>
                                {!order.userId && (
                                    <View style={styles.walkInTag}>
                                        <Text style={styles.walkInTagText}>Walk-in</Text>
                                    </View>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <StatusBadge status={order.status} />
                                <Ionicons name="chevron-forward" size={16} color="#757575" />
                            </View>
                        </View>
                        <Text style={styles.orderCustomer}>{order.customerName || 'Customer'}</Text>
                        <Text style={styles.orderItemsText} numberOfLines={1}>
                            {order.items.map(i => `${i.menuItem.name} ×${i.quantity}`).join(', ')}
                        </Text>
                        <View style={styles.orderCardFooter}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="time-outline" size={12} color="#757575" />
                                <Text style={styles.orderTimeText}>{getRelativeTime(order.timestamp)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={[styles.paymentTag, { color: order.paymentStatus === 'Paid' ? '#4CAF50' : '#EF5350' }]}>
                                    {order.paymentMethod} · {order.paymentStatus}
                                </Text>
                                <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    adminBadge: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 106, 0, 0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    adminLabel: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular' },
    adminName: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#252121', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    logoutText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular' },
    statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
    revenueCard: {
        flex: 1.5, backgroundColor: '#FF6A00', borderRadius: 18, padding: 20, justifyContent: 'center',
    },
    revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 24, fontFamily: 'Inter_700Bold' },
    revenueAmount: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Poppins_700Bold', marginTop: 4 },
    revenueSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
    statsColumn: { flex: 1, gap: 12 },
    statBox: {
        flex: 1, backgroundColor: '#252121', borderRadius: 16, padding: 14, justifyContent: 'center',
        borderWidth: 1, borderColor: '#353030',
    },
    statNumber: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold' },
    statBoxLabel: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
    sectionLabel: {
        color: '#757575', fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
        paddingHorizontal: 20, marginBottom: 12,
    },
    queueRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
    queueItem: {
        flex: 1, backgroundColor: '#252121', borderRadius: 14, padding: 14, alignItems: 'center',
        borderWidth: 1,
    },
    queueCount: { fontSize: 24, fontFamily: 'Inter_700Bold' },
    queueLabel: { color: '#A5A2A2', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
    actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
    walkInBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#FF6A00', paddingVertical: 14, borderRadius: 14,
    },
    walkInText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
    analyticsBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#252121', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#353030',
    },
    analyticsText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    recentHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 12,
    },
    seeAllText: { color: '#FF6A00', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    orderCard: {
        backgroundColor: '#252121', marginHorizontal: 20, marginBottom: 12, borderRadius: 16,
        padding: 16, borderWidth: 1, borderColor: '#353030',
    },
    orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    orderIdText: { color: '#FF6A00', fontSize: 15, fontFamily: 'Inter_700Bold' },
    walkInTag: {
        backgroundColor: 'rgba(255, 193, 7, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    walkInTagText: { color: '#FFC107', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
    orderCustomer: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
    orderItemsText: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 10 },
    orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderTimeText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular' },
    paymentTag: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
    orderAmount: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
