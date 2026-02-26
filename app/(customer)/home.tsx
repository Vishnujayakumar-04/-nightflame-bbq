import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { FoodCard } from '../../components/FoodCard';

export default function HomeScreen() {
    const router = useRouter();
    const { items, addItem, incrementQuantity, decrementQuantity, getItemCount } = useCartStore();
    const { menuItems, isLoading: loading, subscribeToMenu } = useMenuStore();

    useEffect(() => {
        const unsubscribe = subscribeToMenu();
        return unsubscribe;
    }, []);

    const cartCount = getItemCount();

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-white font-[Outfit_700Bold] text-2xl">
                {AppStrings.appName}
            </Text>
            <View className="flex-row items-center gap-x-4">
                <TouchableOpacity onPress={() => router.push('/(customer)/orders')}>
                    <Ionicons name="receipt-outline" size={24} color={AppColors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(customer)/cart')} className="relative">
                    <Ionicons name="cart-outline" size={26} color={AppColors.textPrimary} />
                    {cartCount > 0 && (
                        <View className="absolute -top-1 -right-2 bg-primary w-4 h-4 rounded-full items-center justify-center">
                            <Text className="text-[10px] font-bold text-white leading-none mt-[1px]">
                                {cartCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
                    <Ionicons name="person-outline" size={24} color={AppColors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={AppColors.flameOrange} />
                </View>
            ) : menuItems.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="restaurant" size={64} color={AppColors.textMuted} />
                    <Text className="text-textMuted font-[Outfit_600SemiBold] mt-4 text-lg">Menu coming soon!</Text>
                </View>
            ) : (
                <FlatList
                    data={menuItems}
                    keyExtractor={(item) => item.itemId}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                    renderItem={({ item }) => {
                        const cartItem = items.find(i => i.menuItem.itemId === item.itemId);
                        const quantity = cartItem?.quantity || 0;

                        return (
                            <View className="w-[48%]">
                                <FoodCard
                                    item={item}
                                    quantity={quantity}
                                    onAdd={() => addItem(item)}
                                    onIncrement={() => incrementQuantity(item.itemId)}
                                    onDecrement={() => decrementQuantity(item.itemId)}
                                />
                            </View>
                        );
                    }}
                />
            )}

            {/* Floating Bottom Cart Context */}
            {cartCount > 0 && (
                <View className="absolute bottom-6 left-4 right-4 shadow-lg shadow-primary/30">
                    <TouchableOpacity
                        onPress={() => router.push('/(customer)/cart')}
                        className="bg-primary rounded-2xl p-4 flex-row items-center justify-center"
                    >
                        <Ionicons name="storefront" size={20} color="white" />
                        <Text className="text-white font-[Outfit_600SemiBold] text-base ml-2">
                            View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
