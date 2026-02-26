import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, Switch, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Order, OrderStatus, MenuItem } from '../../types/models';
import { useOrderStore } from '../../store/orderStore';
import { useMenuStore } from '../../store/menuStore';
import firestore from '@react-native-firebase/firestore';

// Utility formatters
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

    // Payment Modal State
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
    const [transactionId, setTransactionId] = useState('');

    const { orders, subscribeToOrders, updateOrderStatus } = useOrderStore();
    const { menuItems, subscribeToMenu, updateMenuItem } = useMenuStore();

    useEffect(() => {
        const unsubOrders = subscribeToOrders();
        const unsubMenu = subscribeToMenu();

        return () => {
            unsubOrders();
            unsubMenu();
        };
    }, []);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Aggregations
    const todayOrders = orders.filter(o => o.timestamp >= startOfToday);
    const monthlyOrders = orders.filter(o => o.timestamp >= startOfMonth);

    const todayOrderCount = todayOrders.length;
    const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0);
    const cashRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid' && o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.totalAmount, 0);
    const upiRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid' && o.paymentMethod === 'UPI').reduce((sum, o) => sum + o.totalAmount, 0);

    const monthlyOrderCount = monthlyOrders.length;
    const monthlyRevenue = monthlyOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate Top Selling Item (All Time)
    const itemSales: Record<string, number> = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            itemSales[item.menuItem.name] = (itemSales[item.menuItem.name] || 0) + item.quantity;
        });
    });

    let topSellingItem = "N/A";
    let maxSold = 0;
    for (const [name, qty] of Object.entries(itemSales)) {
        if (qty > maxSold) {
            maxSold = qty;
            topSellingItem = name;
        }
    }

    const handleLogout = () => {
        Alert.alert('Logout', 'Sign out of admin?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(auth)/welcome') }
        ]);
    };

    const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    const handleOpenPaymentModal = (order: Order) => {
        setSelectedOrder(order);
        setPaymentMethod('Cash');
        setTransactionId('');
        setPaymentModalVisible(true);
    };

    const submitPayment = async () => {
        if (!selectedOrder) return;
        if (paymentMethod === 'UPI' && !transactionId.trim()) {
            Alert.alert('Required', 'Please enter UPI Transaction ID');
            return;
        }

        try {
            await useOrderStore.getState().updateOrderPayment(selectedOrder.orderId, {
                paymentStatus: 'Paid',
                paymentMethod: paymentMethod,
                transactionId: paymentMethod === 'UPI' ? transactionId : undefined,
                paidAt: Date.now()
            });
            setPaymentModalVisible(false);
            Alert.alert('Success', 'Payment collected successfully');
        } catch (e) {
            Alert.alert('Error', 'Failed to update payment');
        }
    };

    const toggleMenuAvailability = (itemId: string, current: boolean) => {
        updateMenuItem(itemId, { available: !current });
    };

    const handleSeedActualMenu = async () => {
        Alert.alert('Seed Menu', 'This will wipe all existing menu items and replace them. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Proceed',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const batch = firestore().batch();

                        // 1. Wipe existing
                        const snapshot = await firestore().collection('menuItems').get();
                        snapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });

                        // 2. Insert new exact list
                        const actualMenu = [
                            { name: 'Grilled Leg Piece – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled leg piece' },
                            { name: 'Grilled Thigh – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled thigh piece' },
                            { name: 'Grilled Drumstick – 2 Pcs', price: 120, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Two grilled drumsticks' },
                            { name: 'Chicken Lollipop – 5 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Five pieces of chicken lollipop' },
                            { name: 'BBQ Wings – 6 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Six pieces of BBQ wings' },
                            { name: 'Wings & Lollipop Combo', price: 219, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['Wings (6 Pcs)', 'Lollipop (5 Pcs)'], description: 'Best entry combo' },
                            { name: 'Grill Duo Combo', price: 259, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', '1 Thigh'], description: 'Classic 2-piece grill' },
                            { name: 'Grill Mix Combo', price: 339, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', 'Drumstick (2 Pcs)', 'Wings (6 Pcs)'], description: 'Mixed grill platter' },
                            { name: 'Mini Party Combo', price: 359, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)'], description: 'Perfect for small gatherings' },
                            { name: 'Family Combo', price: 579, preparationTime: 25, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)', 'Drumstick (2 Pcs)'], description: 'Large combo for the whole family' },
                            { name: 'NightFlame Mega Grill', price: 799, preparationTime: 30, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs', '2 Thighs', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)', 'Drumstick (2 Pcs)'], description: 'The ultimate Mega Grill' },
                        ];

                        actualMenu.forEach(item => {
                            const newRef = firestore().collection('menuItems').doc();
                            batch.set(newRef, item);
                        });

                        await batch.commit();
                        Alert.alert('Success', 'Actual Menu successfully seeded!');
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }
            }
        ]);
    };

    const renderHeader = () => (
        <View className="px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/20">
                    <Ionicons name="shield-checkmark" size={20} color={AppColors.flameOrange} />
                </View>
                <Text className="text-white font-[Outfit_700Bold] text-2xl ml-3">
                    {AppStrings.dashboard}
                </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="p-2">
                <Ionicons name="log-out-outline" size={24} color={AppColors.error} />
            </TouchableOpacity>
        </View>
    );

    const renderRevenueCard = () => (
        <View className="mx-6 mb-6">
            <View className="p-5 rounded-3xl bg-primary mb-3">
                <View className="flex-row items-end justify-between">
                    <View>
                        <Text className="text-white/80 font-[Inter_500Medium] text-sm mb-1">
                            Today's Revenue
                        </Text>
                        <Text className="text-white font-[Outfit_800ExtraBold] text-3xl">
                            {formatCurrency(todayRevenue)}
                        </Text>
                    </View>
                    <View className="bg-white/20 px-4 py-2 rounded-2xl items-center">
                        <Text className="text-white font-[Outfit_700Bold] text-xl">
                            {todayOrderCount}
                        </Text>
                        <Text className="text-white/80 font-[Inter_500Medium] text-xs">
                            Orders Today
                        </Text>
                    </View>
                </View>

                {/* Cash vs UPI Breakdown */}
                <View className="flex-row mt-4 pt-4 border-t border-white/20">
                    <View className="flex-1">
                        <Text className="text-white/60 text-xs text-center border-r border-white/20">Cash: {formatCurrency(cashRevenue)}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white/60 text-xs text-center">UPI: {formatCurrency(upiRevenue)}</Text>
                    </View>
                </View>
            </View>

            {/* Monthly Analytics Row */}
            <View className="flex-row justify-between">
                <View className="bg-surfaceCard p-4 rounded-2xl border border-divider flex-1 mr-2">
                    <Text className="text-textMuted text-xs mb-1">Monthly Rev</Text>
                    <Text className="text-white font-[Outfit_700Bold] text-lg">{formatCurrency(monthlyRevenue)}</Text>
                    <Text className="text-primary text-xs mt-1">{monthlyOrderCount} orders</Text>
                </View>
                <View className="bg-surfaceCard p-4 rounded-2xl border border-divider flex-1 ml-2">
                    <Text className="text-textMuted text-xs mb-1">Top Item</Text>
                    <Text className="text-white font-[Outfit_700Bold] text-xs" numberOfLines={2}>{topSellingItem}</Text>
                    <Text className="text-primary text-xs mt-1">{maxSold} sold</Text>
                </View>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View className="flex-row px-6 mb-4">
            <TouchableOpacity
                className={`flex-1 py-3 border-b-2 items-center ${activeTab === 'orders' ? 'border-primary' : 'border-divider'}`}
                onPress={() => setActiveTab('orders')}
            >
                <Text className={`font-[Outfit_600SemiBold] text-base ${activeTab === 'orders' ? 'text-primary' : 'text-textMuted'}`}>
                    Orders
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className={`flex-1 py-3 border-b-2 items-center ${activeTab === 'menu' ? 'border-primary' : 'border-divider'}`}
                onPress={() => setActiveTab('menu')}
            >
                <Text className={`font-[Outfit_600SemiBold] text-base ${activeTab === 'menu' ? 'text-primary' : 'text-textMuted'}`}>
                    Menu
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderOrdersList = () => (
        <FlatList
            data={orders}
            keyExtractor={item => item.orderId}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
                <View className="bg-surfaceCard p-4 rounded-2xl mb-4 border border-divider">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-white font-[Outfit_700Bold] text-base">
                                {formatOrderIdShort(item.orderId)}
                            </Text>
                            <Text className="text-textMuted text-xs">
                                {item.userId ? 'Pre-order' : 'Walk-in'} • {item.customerName || 'Customer'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-primary font-[Outfit_700Bold] text-base">
                                {formatCurrency(item.totalAmount)}
                            </Text>
                            <Text className={`text-xs font-[Inter_600SemiBold] ${item.paymentStatus === 'Paid' ? 'text-success' : 'text-error'}`}>
                                {item.paymentStatus} {item.paymentStatus === 'Paid' ? `(${item.paymentMethod})` : ''}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time-outline" size={14} color={AppColors.textMuted} />
                        <Text className="text-textSecondary font-[Inter_400Regular] text-sm ml-1.5 mr-4">
                            Pickup: {formatTime(item.pickupTime)}
                        </Text>
                    </View>

                    <Text className="text-textSecondary font-[Inter_400Regular] text-sm mb-4" numberOfLines={2}>
                        {item.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                    </Text>

                    {/* Status Update Row */}
                    <View className="flex-row items-center border-t border-divider/50 pt-3 mt-4">
                        <Text className="text-textMuted font-[Inter_500Medium] text-xs mr-3">
                            {AppStrings.updateStatus}:
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Object.values(OrderStatus).map(status => {
                                const isActive = item.status === status;
                                return (
                                    <TouchableOpacity
                                        key={status}
                                        disabled={isActive}
                                        onPress={() => handleStatusUpdate(item.orderId, status)}
                                        className={`mr-2 px-3 py-1.5 rounded-lg border ${isActive ? 'bg-primary border-primary' : 'bg-surfaceLight border-divider'
                                            }`}
                                    >
                                        <Text className={`font-[Inter_500Medium] text-xs ${isActive ? 'text-white' : 'text-textMuted'
                                            }`}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Collect Payment Action */}
                    {item.paymentStatus === 'Unpaid' && (
                        <TouchableOpacity
                            onPress={() => handleOpenPaymentModal(item)}
                            className="mt-4 bg-success/20 border border-success/50 py-3 rounded-xl items-center flex-row justify-center"
                        >
                            <Ionicons name="card-outline" size={18} color={AppColors.success} className="mr-2" />
                            <Text className="text-success font-[Outfit_700Bold]">Collect Payment</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        />
    );

    const renderMenuList = () => (
        <FlatList
            data={menuItems}
            keyExtractor={item => item.itemId}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            ListHeaderComponent={() => (
                <TouchableOpacity onPress={handleSeedActualMenu} className="bg-flameOrange/20 border border-flameOrange p-4 rounded-2xl items-center mb-6">
                    <Text className="text-flameOrange font-[Outfit_700Bold] text-lg">⚠️ Seed Actual Shop Menu</Text>
                    <Text className="text-textMuted text-xs mt-1 text-center font-[Inter_400Regular]">This will wipe and replace all items with the provided list</Text>
                </TouchableOpacity>
            )}
            renderItem={({ item }) => (
                <View className="bg-surfaceCard p-4 rounded-2xl mb-4 border border-divider flex-row items-center">
                    <View className="flex-1">
                        <Text className="text-white font-[Outfit_600SemiBold] text-base mb-1">
                            {item.name}
                        </Text>
                        <Text className="text-primary font-[Outfit_600SemiBold] text-sm">
                            {formatCurrency(item.price)}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Switch
                            value={item.available}
                            onValueChange={() => toggleMenuAvailability(item.itemId, item.available)}
                            trackColor={{ false: AppColors.surfaceLight, true: AppColors.success + '80' }}
                            thumbColor={item.available ? AppColors.success : AppColors.textMuted}
                        />
                        <TouchableOpacity
                            onPress={() => router.push(`/(admin)/menu-form?itemId=${item.itemId}`)}
                            className="ml-4 p-2"
                        >
                            <Ionicons name="create-outline" size={22} color={AppColors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        />
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}
            {renderRevenueCard()}
            {renderTabs()}

            <View className="flex-1">
                {activeTab === 'orders' ? renderOrdersList() : renderMenuList()}
            </View>

            {/* Floating FAB for Menu Tab */}
            {activeTab === 'menu' && (
                <TouchableOpacity
                    onPress={() => router.push('/(admin)/menu-form')}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-black/50"
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            )}

            {/* Floating FAB for Walk-in Orders */}
            {activeTab === 'orders' && (
                <TouchableOpacity
                    onPress={() => router.push('/(admin)/walk-in')}
                    className="absolute bottom-6 right-6 h-14 px-6 bg-primary rounded-full flex-row items-center shadow-lg shadow-black/50"
                >
                    <Ionicons name="add" size={24} color="white" />
                    <Text className="text-white font-[Outfit_700Bold] text-base ml-2">Walk-in Order</Text>
                </TouchableOpacity>
            )}

            {/* Payment Modal */}
            <Modal
                visible={paymentModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-surfaceCard p-6 rounded-t-3xl border-t border-divider">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white font-[Outfit_700Bold] text-xl">Collect Payment</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <View className="mb-6">
                                <Text className="text-textMuted mb-1 text-sm">Amount Due</Text>
                                <Text className="text-white font-[Outfit_800ExtraBold] text-4xl text-primary">
                                    {formatCurrency(selectedOrder.totalAmount)}
                                </Text>
                            </View>
                        )}

                        <Text className="text-white/60 text-xs mb-2">Select Payment Method</Text>
                        <View className="flex-row mb-6">
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('Cash')}
                                className={`flex-1 py-4 rounded-l-xl border flex-row justify-center items-center ${paymentMethod === 'Cash' ? 'bg-primary border-primary' : 'bg-surfaceLight border-divider'}`}
                            >
                                <Ionicons name="cash-outline" size={20} color={paymentMethod === 'Cash' ? 'white' : AppColors.textMuted} className="mr-2" />
                                <Text className={`font-[Outfit_600SemiBold] text-lg ${paymentMethod === 'Cash' ? 'text-white' : 'text-textMuted'}`}>Cash</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('UPI')}
                                className={`flex-1 py-4 rounded-r-xl border flex-row justify-center items-center ${paymentMethod === 'UPI' ? 'bg-primary border-primary' : 'bg-surfaceLight border-divider'}`}
                            >
                                <Ionicons name="qr-code-outline" size={20} color={paymentMethod === 'UPI' ? 'white' : AppColors.textMuted} className="mr-2" />
                                <Text className={`font-[Outfit_600SemiBold] text-lg ${paymentMethod === 'UPI' ? 'text-white' : 'text-textMuted'}`}>UPI</Text>
                            </TouchableOpacity>
                        </View>

                        {paymentMethod === 'UPI' && (
                            <View className="mb-6">
                                <Text className="text-white/60 text-xs mb-2">UPI Transaction ID</Text>
                                <TextInput
                                    value={transactionId}
                                    onChangeText={setTransactionId}
                                    placeholder="Enter 12-digit UTR/Txn ID"
                                    placeholderTextColor={AppColors.textMuted}
                                    className="bg-surfaceLight text-white px-4 py-4 rounded-xl font-[Inter_500Medium] border border-divider text-base"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={submitPayment}
                            className="bg-success py-4 rounded-xl items-center shadow-lg shadow-success/40 mb-4"
                        >
                            <Text className="text-white font-[Outfit_700Bold] text-lg">Mark as Paid</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
