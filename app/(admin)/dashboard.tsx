import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useShopStore } from '../../store/shopStore';
import { useMenuStore } from '../../store/menuStore';
import { PaymentMethod, OrderStatus, PaymentStatus } from '../../constants/enums';
import { Order } from '../../types/models';
import { useState } from 'react';
import { TextInput, Switch } from 'react-native';
import { AdminPaymentModal } from '../../components/AdminPaymentModal';
import { AdminActionModal } from '../../components/AdminActionModal';
import { formatCurrency, formatOrderIdShort } from '../../utils/formatters';




export default function AdminDashboardScreen() {
    const router = useRouter();
    const { orders, subscribeToOrders, updateOrderStatus, confirmPayment, lockOrder, unlockOrder } = useOrderStore();
    const { signOut } = useAuthStore();
    const { menuItems, subscribeToMenu } = useMenuStore();
    const { status, subscribeToStatus, updateStatus } = useShopStore();

    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showSpecialPicker, setShowSpecialPicker] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);

    const currentSpecialItem = menuItems.find(i => i.itemId === status?.todaySpecialItemId) || null;

    useEffect(() => {
        const unsubOrders = subscribeToOrders();
        const unsubMenu = subscribeToMenu();
        const unsubStatus = subscribeToStatus();
        return () => {
            unsubOrders();
            unsubMenu();
            unsubStatus();
        };
    }, []);

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

    // Calculate dynamic stats
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayOrders = orders.filter(o => o.timestamp >= startOfToday);
    const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

    const todayRevenue = todayOrders.reduce((sum, order) => {
        if (order.status !== OrderStatus.CANCELLED && (order.paymentStatus === PaymentStatus.PAID || order.status === OrderStatus.COMPLETED)) {
            return sum + order.totalAmount;
        }
        return sum;
    }, 0);
    const todayOrdersCount = todayOrders.length;
    const activeOrdersCount = activeOrders.length;

    // Live queue counts
    const pendingCount = activeOrders.filter(o => o.status === OrderStatus.PENDING).length;
    const confirmedCount = activeOrders.filter(o => o.status === OrderStatus.ACCEPTED).length;
    const preparingCount = activeOrders.filter(o => o.status === OrderStatus.PREPARING).length;
    const readyCount = activeOrders.filter(o => o.status === OrderStatus.READY).length;



    const handleLogout = () => {
        Alert.alert('Logout', 'Sign out of admin?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive', onPress: async () => {
                    await signOut();
                    router.replace('/(auth)/welcome');
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Sticky Header Area */}
            <View style={{ backgroundColor: '#1A1818', zIndex: 10 }}>
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
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.statsContainer}>
                    <View style={styles.revenueCard}>
                        <Text style={styles.revenueLabel}>₹</Text>
                        <Text style={styles.revenueAmount}>{formatCurrency(todayRevenue)}</Text>
                        <Text style={styles.revenueSubLabel}>Today's Revenue</Text>
                    </View>
                    <View style={styles.statsColumn}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{todayOrdersCount}</Text>
                            <Text style={styles.statBoxLabel}>Orders Today</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{activeOrdersCount}</Text>
                            <Text style={styles.statBoxLabel}>Active Now</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* LIVE QUEUE COUNTS */}
                <Text style={styles.sectionLabel}>LIVE QUEUE</Text>
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.queueRow}>
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
                </Animated.View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* OWNER CONTROLS GRID */}
                <Text style={styles.sectionLabel}>OWNER CONTROLS</Text>
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.gridContainer}>
                    <TouchableOpacity style={styles.gridBtnPrimary} onPress={() => router.push('/(admin)/walk-in')}>
                        <Ionicons name="people" size={32} color="#FFFFFF" />
                        <Text style={styles.gridBtnTextPrimary}>Walk-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridBtn} onPress={() => router.push('/(admin)/orders')}>
                        <Ionicons name="receipt" size={32} color="#FF6A00" />
                        <Text style={styles.gridBtnText}>Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridBtn} onPress={() => router.push('/(admin)/menu-management')}>
                        <Ionicons name="restaurant" size={32} color="#FF6A00" />
                        <Text style={styles.gridBtnText}>Menu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridBtn} onPress={() => setShowTimeModal(true)}>
                        <Ionicons name="time" size={32} color="#FF6A00" />
                        <Text style={styles.gridBtnText}>Time</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* TODAY'S SPECIAL */}
                <Text style={styles.sectionLabel}>TODAY'S SPECIAL</Text>
                <Animated.View entering={FadeInDown.delay(375).duration(600)} style={styles.controlCard}>
                    <TouchableOpacity
                        style={styles.controlRow}
                        onPress={() => setShowSpecialPicker(true)}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.controlTitle}>Daily Special Item</Text>
                            <Text style={styles.controlSub}>
                                {currentSpecialItem
                                    ? `🔥 ${currentSpecialItem.name}`
                                    : 'Tap to set today\'s special'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#757575" />
                    </TouchableOpacity>
                </Animated.View>

            </ScrollView>

            {
                selectedOrderForPayment && (
                    <AdminPaymentModal
                        visible={isPaymentModalVisible}
                        orderId={selectedOrderForPayment.orderId}
                        amount={selectedOrderForPayment.totalAmount}
                        customerName={selectedOrderForPayment.customerName || 'Walk-in'}
                        isLoading={isProcessingPayment}
                        onClose={handleClosePaymentModal}
                        onConfirm={handleConfirmPayment}
                    />
                )
            }



            {/* Today's Special Picker Modal */}
            <Modal visible={showSpecialPicker} transparent animationType="slide" onRequestClose={() => setShowSpecialPicker(false)}>
                <Pressable style={specialStyles.overlay} onPress={() => setShowSpecialPicker(false)}>
                    <Pressable style={specialStyles.content} onPress={(e) => e.stopPropagation()}>
                        <View style={specialStyles.handle} />
                        <Text style={specialStyles.title}>Set Today's Special</Text>
                        <FlatList
                            data={menuItems.filter(i => i.available)}
                            keyExtractor={(item) => item.itemId}
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => {
                                const isSelected = status?.todaySpecialItemId === item.itemId;
                                return (
                                    <TouchableOpacity
                                        style={[specialStyles.item, isSelected && specialStyles.itemSelected]}
                                        onPress={() => {
                                            updateStatus({ todaySpecialItemId: item.itemId });
                                            setShowSpecialPicker(false);
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={specialStyles.itemName}>{item.name}</Text>
                                            <Text style={specialStyles.itemPrice}>₹{item.price} • {item.category}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={{ color: '#757575', textAlign: 'center', padding: 20 }}>No menu items available</Text>
                            }
                        />
                        <TouchableOpacity
                            style={specialStyles.clearBtn}
                            onPress={() => {
                                updateStatus({ todaySpecialItemId: undefined });
                                setShowSpecialPicker(false);
                            }}
                        >
                            <Text style={specialStyles.clearText}>Clear Special</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* SHOP STATUS MODAL */}
            <Modal visible={showTimeModal} transparent animationType="slide" onRequestClose={() => setShowTimeModal(false)}>
                <Pressable style={specialStyles.overlay} onPress={() => setShowTimeModal(false)}>
                    <Pressable style={specialStyles.content} onPress={(e) => e.stopPropagation()}>
                        <View style={specialStyles.handle} />
                        <Text style={specialStyles.title}>Live Shop Status</Text>
                        
                        <View style={styles.controlRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.controlTitle}>Shop is {status?.isOpen ? 'OPEN' : 'CLOSED'}</Text>
                                <Text style={styles.controlSub}>{status?.isOpen ? 'Accepting orders' : 'Hidden from customers'}</Text>
                            </View>
                            <Switch
                                value={status?.isOpen}
                                onValueChange={(val) => updateStatus({ isOpen: val })}
                                trackColor={{ false: '#3A3A3A', true: 'rgba(76, 175, 80, 0.4)' }}
                                thumbColor={status?.isOpen ? '#4CAF50' : '#757575'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.timeInputsRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Open Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={status?.openTime}
                                    onChangeText={(t) => updateStatus({ openTime: t })}
                                    placeholder="06:00 PM"
                                    placeholderTextColor="#555"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Close Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={status?.closeTime}
                                    onChangeText={(t) => updateStatus({ closeTime: t })}
                                    placeholder="11:00 PM"
                                    placeholderTextColor="#555"
                                />
                            </View>
                        </View>

                        {!status?.isOpen && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.inputLabel}>Closing Message</Text>
                                <TextInput
                                    style={styles.messageInput}
                                    value={status?.message}
                                    onChangeText={(m) => updateStatus({ message: m })}
                                    placeholder="Message for customers"
                                    placeholderTextColor="#555"
                                    multiline
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[specialStyles.clearBtn, { borderColor: '#4CAF50', marginTop: 24 }]}
                            onPress={() => setShowTimeModal(false)}
                        >
                            <Text style={[specialStyles.clearText, { color: '#4CAF50' }]}>Done</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    adminBadge: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255, 106, 0, 0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    adminLabel: { color: '#A5A2A2', fontSize: 11, fontFamily: 'Urbanist_400Regular' },
    adminName: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Urbanist_700Bold' },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#252121', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    },
    logoutText: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Urbanist_400Regular' },
    statsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
    revenueCard: {
        flex: 1.5, backgroundColor: '#FF6A00', borderRadius: 16, padding: 14, justifyContent: 'center',
    },
    revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 20, fontFamily: 'Urbanist_700Bold' },
    revenueAmount: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Urbanist_700Bold', marginTop: 2 },
    revenueSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Urbanist_400Regular', marginTop: 3 },
    statsColumn: { flex: 1, gap: 10 },
    statBox: {
        flex: 1, backgroundColor: '#252121', borderRadius: 16, padding: 10, justifyContent: 'center',
        elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
    },
    statNumber: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Urbanist_800ExtraBold' },
    statBoxLabel: { color: '#A5A2A2', fontSize: 10, fontFamily: 'Urbanist_500Medium', marginTop: 2 },
    sectionLabel: {
        color: '#757575', fontSize: 11, fontFamily: 'Urbanist_600SemiBold', letterSpacing: 1,
        paddingHorizontal: 16, marginBottom: 6,
    },
    queueRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12 },
    queueItem: {
        flex: 1, backgroundColor: '#252121', borderRadius: 12, padding: 10, alignItems: 'center',
        borderWidth: 1,
    },
    queueCount: { fontSize: 20, fontFamily: 'Urbanist_700Bold' },
    queueLabel: { color: '#A5A2A2', fontSize: 10, fontFamily: 'Urbanist_400Regular', marginTop: 3 },
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        paddingHorizontal: 16, marginBottom: 4, rowGap: 10,
    },
    gridBtnPrimary: {
        width: '48%', aspectRatio: 1, backgroundColor: '#FF6A00', borderRadius: 24,
        alignItems: 'center', justifyContent: 'center', gap: 6,
        elevation: 8, shadowColor: '#FF6A00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
    },
    gridBtn: {
        width: '48%', aspectRatio: 1, backgroundColor: '#252121', borderRadius: 24,
        alignItems: 'center', justifyContent: 'center', gap: 6,
        borderWidth: 1, borderColor: '#353030',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    },
    gridBtnTextPrimary: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Urbanist_700Bold', textAlign: 'center' },
    gridBtnText: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Urbanist_600SemiBold', textAlign: 'center' },
    controlCard: {
        backgroundColor: '#252121',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#353030',
        marginBottom: 12,
    },
    controlRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    controlTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Urbanist_700Bold' },
    controlSub: { color: '#757575', fontSize: 11, fontFamily: 'Urbanist_400Regular', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#353030', marginVertical: 10 },
    timeInputsRow: { flexDirection: 'row', gap: 10 },
    inputLabel: { color: '#A5A2A2', fontSize: 11, fontFamily: 'Urbanist_600SemiBold', marginBottom: 4 },
    timeInput: {
        backgroundColor: '#1A1818',
        borderRadius: 10,
        padding: 8,
        color: '#FFFFFF',
        fontFamily: 'Urbanist_600SemiBold',
        borderWidth: 1,
        borderColor: '#353030',
    },
    messageInput: {
        backgroundColor: '#1A1818',
        borderRadius: 10,
        padding: 10,
        color: '#FFFFFF',
        fontFamily: 'Urbanist_400Regular',
        borderWidth: 1,
        borderColor: '#353030',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    walkInTag: {
        backgroundColor: 'rgba(255, 193, 7, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    walkInTagText: { color: '#FFC107', fontSize: 10, fontFamily: 'Urbanist_700Bold' },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, fontFamily: 'Urbanist_700Bold' },
});

const specialStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
    content: {
        backgroundColor: '#1A1818', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 20, paddingBottom: 40, maxHeight: '70%',
    },
    handle: {
        width: 40, height: 4, backgroundColor: '#555', borderRadius: 2,
        alignSelf: 'center', marginBottom: 16,
    },
    title: {
        color: '#FFFFFF', fontSize: 20, fontFamily: 'Urbanist_700Bold',
        textAlign: 'center', marginBottom: 16,
    },
    item: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, backgroundColor: '#252121', borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#353030',
    },
    itemSelected: {
        borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.08)',
    },
    itemName: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Urbanist_600SemiBold' },
    itemPrice: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Urbanist_400Regular', marginTop: 2 },
    clearBtn: {
        padding: 14, alignItems: 'center', marginTop: 8,
        borderWidth: 1, borderColor: '#353030', borderRadius: 12,
    },
    clearText: { color: '#EF5350', fontSize: 14, fontFamily: 'Urbanist_600SemiBold' },
});
