import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Order, OrderStatus, MenuItem } from '../../types/models';

// Utility formatters
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

    // MOCK DATA
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const todayRevenue = 4590;
    const todayOrderCount = 12;

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setOrders([
                {
                    orderId: 'ord_admin_1',
                    userId: 'user_x',
                    items: [{ menuItem: { name: 'Flame Grilled Chicken' } as any, quantity: 2 }],
                    totalAmount: 998,
                    status: OrderStatus.pending,
                    pickupTime: Date.now() + 1800000,
                    timestamp: Date.now()
                }
            ]);
            setMenuItems([
                { itemId: '1', name: 'Flame Grilled Chicken', price: 499, available: true, imageUrl: 'https://via.placeholder.com/300' } as any,
                { itemId: '2', name: 'Spicy Wings', price: 299, available: false, imageUrl: '' } as any
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Sign out of admin?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(auth)/welcome') }
        ]);
    };

    const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    };

    const toggleMenuAvailability = (itemId: string) => {
        setMenuItems(menuItems.map(m => m.itemId === itemId ? { ...m, available: !m.available } : m));
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
        <View className="mx-6 mb-6 p-5 rounded-3xl bg-primary">
            <View className="flex-row items-end justify-between">
                <View>
                    <Text className="text-white/80 font-[Inter_500Medium] text-sm mb-1">
                        {AppStrings.todayRevenue}
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
                        Orders
                    </Text>
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
                        <Text className="text-white font-[Outfit_700Bold] text-base">
                            {formatOrderIdShort(item.orderId)}
                        </Text>
                        <Text className="text-primary font-[Outfit_700Bold] text-base">
                            {formatCurrency(item.totalAmount)}
                        </Text>
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
                    <View className="flex-row items-center border-t border-divider/50 pt-3">
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
                                        onPress={() => updateOrderStatus(item.orderId, status)}
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
                </View>
            )}
        />
    );

    const renderMenuList = () => (
        <FlatList
            data={menuItems}
            keyExtractor={item => item.itemId}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
                            onValueChange={() => toggleMenuAvailability(item.itemId)}
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
                {loading ? (
                    <ActivityIndicator size="large" color={AppColors.flameOrange} className="mt-20" />
                ) : (
                    activeTab === 'orders' ? renderOrdersList() : renderMenuList()
                )}
            </View>

            {/* Floating FAB for Menu Tab */}
            {activeTab === 'menu' && (
                <TouchableOpacity
                    onPress={() => router.push('/(admin)/menu-form')}
                    className="absolute bottom-8 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/50"
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}
