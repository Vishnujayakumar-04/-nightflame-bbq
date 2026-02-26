import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/ui/Button';

// Utility formatters
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { items, incrementQuantity, decrementQuantity, getCartTotal } = useCartStore();

    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const cartTotal = getCartTotal();

    // Generate time slots (every 15 mins for next 3 hours)
    const timeSlots = useMemo(() => {
        const slots: Date[] = [];
        const now = new Date();

        // Start from next 30 min mark, or next 15 if already past 30
        const startSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
        startSlot.setMinutes(startSlot.getMinutes() + 30);
        if (startSlot < now) {
            startSlot.setMinutes(startSlot.getMinutes() + 15);
        }

        for (let i = 0; i < 12; i++) {
            const time = new Date(startSlot.getTime() + i * 15 * 60000);
            if (time > now) {
                slots.push(time);
            }
        }
        return slots;
    }, []);

    const handlePlaceOrder = () => {
        if (!selectedTime) return;
        setIsPlacingOrder(true);
        // TODO: Firebase save order
        setTimeout(() => {
            setIsPlacingOrder(false);
            // TODO: Clear cart
            useCartStore.getState().clearCart();
            // router.replace(`/order-confirmation/${newOrderId}`);
            router.replace('/(customer)/orders');
        }, 1500);
    };

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 h-14">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                <Ionicons name="chevron-back" size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-white font-[Outfit_600SemiBold] text-lg">
                {AppStrings.cart}
            </Text>
            <View className="w-10" />
        </View>
    );

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center -mt-20">
            <Ionicons name="bag-handle-outline" size={80} color={AppColors.textMuted} />
            <Text className="text-textMuted font-[Outfit_500Medium] text-lg mt-4 mb-8">
                {AppStrings.emptyCart}
            </Text>
            <View className="w-48">
                <Button
                    title="Browse Menu"
                    onPress={() => router.push('/(customer)/home')}
                    icon={<Ionicons name="restaurant" size={20} color="white" />}
                />
            </View>
        </View>
    );

    const renderCartItems = () => (
        <ScrollView className="flex-1 px-4 pt-4">
            {items.map((cartItem) => {
                const item = cartItem.menuItem;
                return (
                    <View
                        key={item.itemId}
                        className="bg-surfaceCard p-4 rounded-2xl mb-3 border border-divider flex-row items-center"
                    >
                        {/* Info */}
                        <View className="flex-1">
                            <Text className="text-white font-[Outfit_600SemiBold] text-base mb-1">
                                {item.name}
                            </Text>
                            <Text className="text-primary font-[Inter_500Medium] text-sm">
                                {formatCurrency(item.price)}
                            </Text>
                        </View>

                        {/* Stepper */}
                        <View className="flex-row items-center bg-surfaceLight rounded-xl px-1 py-1 mx-3 border border-divider">
                            <TouchableOpacity
                                onPress={() => decrementQuantity(item.itemId)}
                                className="p-1 px-2"
                            >
                                <Ionicons name="remove" size={16} color={AppColors.flameOrange} />
                            </TouchableOpacity>
                            <Text className="text-white font-[Outfit_700Bold] text-base px-2">
                                {cartItem.quantity}
                            </Text>
                            <TouchableOpacity
                                onPress={() => incrementQuantity(item.itemId)}
                                className="p-1 px-2"
                            >
                                <Ionicons name="add" size={16} color={AppColors.flameOrange} />
                            </TouchableOpacity>
                        </View>

                        {/* Item Total */}
                        <View className="w-20 items-end">
                            <Text className="text-white font-[Outfit_700Bold] text-base">
                                {formatCurrency(item.price * cartItem.quantity)}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );

    const renderBottomCheckout = () => (
        <View
            className="bg-surface px-5 pt-5 pb-8 rounded-t-3xl border-t border-divider shadow-2xl"
            style={{ paddingBottom: Math.max(32, insets.bottom + 16) }}
        >
            {/* Time Picker Trigger */}
            <TouchableOpacity
                onPress={() => setTimePickerVisible(true)}
                className="bg-surfaceLight p-4 rounded-2xl flex-row items-center border border-divider mb-5"
            >
                <Ionicons name="time-outline" size={24} color={AppColors.flameOrange} />
                <View className="flex-1 ml-3">
                    <Text className="text-textSecondary font-[Inter_400Regular] text-xs">
                        {AppStrings.pickupTime}
                    </Text>
                    <Text className={`font-[Outfit_600SemiBold] text-base mt-0.5 ${selectedTime ? 'text-white' : 'text-textMuted'}`}>
                        {selectedTime ? formatTime(selectedTime) : AppStrings.selectPickupTime}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
            </TouchableOpacity>

            {/* Totals & Submit */}
            <View className="flex-row items-center justify-between mb-5">
                <Text className="text-white font-[Outfit_600SemiBold] text-xl">
                    {AppStrings.total}
                </Text>
                <Text className="text-primary font-[Outfit_800ExtraBold] text-2xl tracking-tight">
                    {formatCurrency(cartTotal)}
                </Text>
            </View>

            <Button
                title={AppStrings.placeOrder}
                disabled={!selectedTime}
                loading={isPlacingOrder}
                onPress={handlePlaceOrder}
                icon={<Ionicons name="checkmark-circle-outline" size={20} color="white" />}
            />
        </View>
    );

    // Time Picker Modal Render
    const renderTimePickerModal = () => (
        <Modal visible={isTimePickerVisible} transparent animationType="slide">
            <Pressable
                className="flex-1 bg-black/60 justify-end"
                onPress={() => setTimePickerVisible(false)}
            >
                <Pressable
                    className="bg-surface rounded-t-3xl p-6"
                    style={{ paddingBottom: Math.max(32, insets.bottom + 16) }}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="items-center mb-6">
                        <View className="w-10 h-1 bg-textMuted rounded-full" />
                    </View>
                    <Text className="text-white font-[Outfit_600SemiBold] text-xl mb-6">
                        {AppStrings.selectPickupTime}
                    </Text>
                    <View className="flex-row flex-wrap gap-2.5">
                        {timeSlots.map((time) => {
                            const isSelected = selectedTime?.getTime() === time.getTime();
                            return (
                                <TouchableOpacity
                                    key={time.getTime()}
                                    onPress={() => {
                                        setSelectedTime(time);
                                        setTimePickerVisible(false);
                                    }}
                                    className={`px-4 py-3 rounded-xl border ${isSelected
                                            ? 'bg-primary border-primary'
                                            : 'bg-surfaceLight border-divider'
                                        }`}
                                >
                                    <Text className={`font-[Outfit_500Medium] text-sm ${isSelected ? 'text-white font-[Outfit_700Bold]' : 'text-textSecondary'
                                        }`}>
                                        {formatTime(time)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}
            {items.length === 0 ? renderEmptyState() : (
                <>
                    {renderCartItems()}
                    {renderBottomCheckout()}
                    {renderTimePickerModal()}
                </>
            )}
        </SafeAreaView>
    );
}
