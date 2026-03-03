import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useOrderStore } from '../../store/orderStore';
import { PaymentStatus, PaymentMethod } from '../../constants/enums';

const { width } = Dimensions.get('window');
const formatCurrency = (amount: number) => `₹${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function AnalyticsScreen() {
    const { orders, subscribeToOrders } = useOrderStore();
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    const now = new Date();

    // Calculate stats
    const stats = useMemo(() => {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const periodStart = period === 'week' ? startOfWeek.getTime() : period === 'month' ? startOfMonth.getTime() : startOfYear.getTime();
        const periodOrders = orders.filter(o => o.timestamp >= periodStart);
        const paidOrders = periodOrders.filter(o => o.paymentStatus === PaymentStatus.PAID);

        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = paidOrders.length;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Unique customers
        const customers = new Set(periodOrders.map(o => o.userId || o.customerName || 'walk-in'));

        // Revenue by category
        const categoryRevenue: Record<string, number> = {};
        paidOrders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.menuItem.category || 'Other';
                categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.menuItem.price * item.quantity);
            });
        });

        // Daily revenue for the week
        const dailyRevenue: number[] = [0, 0, 0, 0, 0, 0, 0];
        const dailyOrders: number[] = [0, 0, 0, 0, 0, 0, 0];
        if (period === 'week') {
            paidOrders.forEach(order => {
                const day = new Date(order.timestamp).getDay();
                dailyRevenue[day] += order.totalAmount;
                dailyOrders[day] += 1;
            });
        }

        // Payment split
        const upiOrdersArr = paidOrders.filter(o => o.paymentMethod === PaymentMethod.UPI);
        const cashOrdersArr = paidOrders.filter(o => o.paymentMethod === PaymentMethod.CASH);

        const upiRevenue = upiOrdersArr.reduce((sum, o) => sum + o.totalAmount, 0);
        const cashRevenue = cashOrdersArr.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
            totalRevenue,
            totalOrders,
            avgOrder,
            customers: customers.size,
            categoryRevenue,
            dailyRevenue,
            dailyOrders,
            upiOrders: upiOrdersArr.length,
            cashOrders: cashOrdersArr.length,
            upiRevenue,
            cashRevenue,
        };
    }, [orders, period]);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxDailyRev = Math.max(...stats.dailyRevenue, 1);
    const maxDailyOrders = Math.max(...stats.dailyOrders, 1);

    const categoryColors: Record<string, string> = {
        'BBQ': '#FF6A00', 'Wings': '#FF8C40', 'Combo': '#FFB366',
        'Starters': '#FF6A00', 'Mains': '#FF8C40', 'Sides': '#FFB366', 'Drinks': '#4CAF50',
    };

    const totalPayments = stats.upiOrders + stats.cashOrders || 1;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.subtitle}>Revenue & performance insights</Text>
                </View>

                {/* Period Toggle */}
                <View style={styles.periodToggle}>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'week' && styles.periodBtnActive]}
                        onPress={() => setPeriod('week')}
                    >
                        <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>This Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
                        onPress={() => setPeriod('month')}
                    >
                        <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>This Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'year' && styles.periodBtnActive]}
                        onPress={() => setPeriod('year')}
                    >
                        <Text style={[styles.periodText, period === 'year' && styles.periodTextActive]}>This Year</Text>
                    </TouchableOpacity>
                </View>

                {/* Stat Cards Grid */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderColor: '#FF6A00' }]}>
                        <Ionicons name="cash-outline" size={22} color="#FF6A00" />
                        <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
                        <Text style={styles.statLabel}>Total Revenue</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: '#2196F3' }]}>
                        <Ionicons name="receipt-outline" size={22} color="#2196F3" />
                        <Text style={styles.statValue}>{stats.totalOrders}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: '#4CAF50' }]}>
                        <Ionicons name="trending-up" size={22} color="#4CAF50" />
                        <Text style={styles.statValue}>{formatCurrency(stats.avgOrder)}</Text>
                        <Text style={styles.statLabel}>Avg Order</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: '#9C27B0' }]}>
                        <Ionicons name="people-outline" size={22} color="#9C27B0" />
                        <Text style={styles.statValue}>{stats.customers}</Text>
                        <Text style={styles.statLabel}>Customers</Text>
                    </View>
                </Animated.View>

                {/* Weekly Revenue Chart */}
                {period === 'week' && (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Weekly Revenue</Text>
                        <Text style={styles.chartAmount}>{formatCurrency(stats.totalRevenue)}</Text>
                        <View style={styles.lineChart}>
                            {stats.dailyRevenue.map((rev, i) => {
                                const height = (rev / maxDailyRev) * 100;
                                return (
                                    <View key={i} style={styles.linePoint}>
                                        <View style={[styles.dot, { bottom: height }]} />
                                        <Text style={styles.dayLabel}>{dayLabels[i]}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Orders per Day Bar Chart */}
                {period === 'week' && (
                    <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Orders per Day</Text>
                        <View style={styles.barChart}>
                            {stats.dailyOrders.map((count, i) => {
                                const height = (count / maxDailyOrders) * 100;
                                return (
                                    <View key={i} style={styles.barColumn}>
                                        <View style={[styles.bar, { height: Math.max(height, 4) }]} />
                                        <Text style={styles.dayLabel}>{dayLabels[i]}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* Revenue by Category */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Revenue by Category</Text>
                    <View style={styles.categoryList}>
                        {Object.entries(stats.categoryRevenue).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => (
                            <View key={cat} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <View style={[styles.categoryDot, { backgroundColor: categoryColors[cat] || '#FF6A00' }]} />
                                    <Text style={styles.categoryName}>{cat}</Text>
                                </View>
                                <Text style={styles.categoryAmount}>{formatCurrency(rev)}</Text>
                            </View>
                        ))}
                        {Object.keys(stats.categoryRevenue).length === 0 && (
                            <Text style={styles.noDataText}>No data yet</Text>
                        )}
                    </View>
                </Animated.View>

                {/* Payment Split */}
                <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Payment Split</Text>
                    <View style={styles.paymentRow}>
                        <View>
                            <Text style={styles.paymentLabel}>UPI / Online</Text>
                            <Text style={styles.paymentSubLabel}>{stats.upiOrders} orders</Text>
                        </View>
                        <Text style={styles.paymentValue}>
                            {formatCurrency(stats.upiRevenue)} ({Math.round((stats.upiOrders / totalPayments) * 100)}%)
                        </Text>
                    </View>
                    <View style={styles.paymentBar}>
                        <View style={[styles.paymentFill, { width: `${(stats.upiOrders / totalPayments) * 100}%`, backgroundColor: '#2196F3' }]} />
                    </View>

                    <View style={[styles.paymentRow, { marginTop: 20 }]}>
                        <View>
                            <Text style={styles.paymentLabel}>Cash</Text>
                            <Text style={styles.paymentSubLabel}>{stats.cashOrders} orders</Text>
                        </View>
                        <Text style={styles.paymentValue}>
                            {formatCurrency(stats.cashRevenue)} ({Math.round((stats.cashOrders / totalPayments) * 100)}%)
                        </Text>
                    </View>
                    <View style={styles.paymentBar}>
                        <View style={[styles.paymentFill, { width: `${(stats.cashOrders / totalPayments) * 100}%`, backgroundColor: '#4CAF50' }]} />
                    </View>
                </Animated.View>

            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    subtitle: { color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
    periodToggle: {
        flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 14,
        backgroundColor: '#252121', borderRadius: 12, padding: 3,
    },
    periodBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10,
    },
    periodBtnActive: { backgroundColor: '#FF6A00' },
    periodText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    periodTextActive: { color: '#FFFFFF' },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10,
        marginBottom: 14,
    },
    statCard: {
        width: (width - 42) / 2, backgroundColor: '#252121', borderRadius: 14,
        padding: 14, borderLeftWidth: 3, borderWidth: 1, borderColor: '#353030',
    },
    statValue: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 8 },
    statLabel: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
    chartCard: {
        backgroundColor: '#252121', marginHorizontal: 16, borderRadius: 14,
        padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#353030',
    },
    chartTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4 },
    chartAmount: { color: '#FF6A00', fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 16 },
    lineChart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
    linePoint: { alignItems: 'center', flex: 1 },
    dot: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6A00',
        position: 'absolute',
    },
    dayLabel: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 8 },
    barChart: { flexDirection: 'row', justifyContent: 'space-between', height: 140, alignItems: 'flex-end', marginTop: 10 },
    barColumn: { alignItems: 'center', flex: 1 },
    bar: { width: 24, backgroundColor: '#FF6A00', borderRadius: 6, marginBottom: 6 },
    categoryList: { marginTop: 14, gap: 12 },
    categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    categoryDot: { width: 12, height: 12, borderRadius: 3 },
    categoryName: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_400Regular' },
    categoryAmount: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
    noDataText: { color: '#757575', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    paymentLabel: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    paymentSubLabel: { color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
    paymentValue: { color: '#FF6A00', fontSize: 15, fontFamily: 'Inter_700Bold' },
    paymentBar: {

        height: 6, backgroundColor: '#353030', borderRadius: 3, overflow: 'hidden',
    },
    paymentFill: { height: '100%', borderRadius: 3 },
});
