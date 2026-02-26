import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Order, OrderStatus } from '../../types/models';
import { StatusBadge } from '../../components/ui/StatusBadge';

// Utility formatters
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function MyOrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching orders
        setTimeout(() => {
            setOrders([
                {
                    orderId: 'ord_12345abcde',
                    userId: 'user_1',
                    items: [
                        { menuItem: { itemId: '1', name: 'Flame Grilled Chicken', price: 499 } as any, quantity: 1 },
                        { menuItem: { itemId: '2', name: 'Spicy Wings', price: 299 } as any, quantity: 2 }
                    ],
                    totalAmount: 1097,
                    status: OrderStatus.preparing,
                    pickupTime: Date.now() + 3600000,
                    timestamp: Date.now() - 1000000
                },
                {
                    orderId: 'ord_9876xyz',
                    userId: 'user_1',
                    items: [
                        { menuItem: { itemId: '3', name: 'Garlic Bread', price: 149 } as any, quantity: 1 },
                    ],
                    totalAmount: 149,
                    status: OrderStatus.completed,
                    pickupTime: Date.now() - 86400000,
                    timestamp: Date.now() - 90000000
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 h-14">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                <Ionicons name="chevron-back" size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-white font-[Outfit_600SemiBold] text-lg">
                {AppStrings.myOrders}
            </Text>
            <View className="w-10" />
        </View>
    );

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center -mt-20 px-8 text-center">
            <Ionicons name="receipt-outline" size={80} color={AppColors.textMuted} />
            <Text className="text-textMuted font-[Outfit_500Medium] text-lg mt-4 mb-2">
                {AppStrings.noOrders}
            </Text>
            <Text className="text-textSecondary font-[Inter_400Regular] text-sm text-center">
                Place your first order to see it here!
            </Text>
        </View>
    );

    const renderOrderItem = ({ item }: { item: Order }) => {
        const itemsSummary = item.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ');

        return (
            <TouchableOpacity
                // onPress={() => router.push(`/order-tracking/${item.orderId}`)}
                className="bg-surfaceCard p-4 rounded-2xl mb-4 border border-divider"
            >
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white font-[Outfit_700Bold] text-base">
                        {formatOrderIdShort(item.orderId)}
                    </Text>
                    <StatusBadge status={item.status} />
                </View>

                <Text className="text-textSecondary font-[Inter_400Regular] text-sm mb-4" numberOfLines={2}>
                    {itemsSummary}
                </Text>

                <View className="flex-row justify-between items-center pt-3 border-t border-divider/50">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color={AppColors.textMuted} />
                        <Text className="text-textSecondary font-[Inter_400Regular] text-xs ml-1.5 mr-3">
                            {formatTime(item.pickupTime)}
                        </Text>
                        <Text className="text-textSecondary font-[Inter_400Regular] text-xs">
                            {formatDate(item.timestamp)}
                        </Text>
                    </View>

                    <Text className="text-primary font-[Outfit_600SemiBold] text-base">
                        {formatCurrency(item.totalAmount)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={AppColors.flameOrange} />
                </View>
            ) : orders.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.orderId}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
