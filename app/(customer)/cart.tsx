import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppStrings } from '../../constants/Strings';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { LinearGradient } from 'expo-linear-gradient';

const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { items, incrementQuantity, decrementQuantity, getCartTotal, getItemCount } = useCartStore();

    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const { user } = useAuthStore();
    const placeOrder = useOrderStore(state => state.placeOrder);
    const cartTotal = getCartTotal();
    const cartCount = getItemCount();

    const timeSlots = useMemo(() => {
        const slots: Date[] = [];
        const now = new Date();
        let maxPrepTime = 15;
        items.forEach(cartItem => {
            if (cartItem.menuItem.preparationTime && cartItem.menuItem.preparationTime > maxPrepTime) {
                maxPrepTime = cartItem.menuItem.preparationTime;
            }
        });
        const minPickupTime = new Date(now.getTime() + maxPrepTime * 60000);
        const startSlot = new Date(minPickupTime.getFullYear(), minPickupTime.getMonth(), minPickupTime.getDate(), minPickupTime.getHours(), 0, 0);
        while (startSlot < minPickupTime) {
            startSlot.setMinutes(startSlot.getMinutes() + 15);
        }
        for (let i = 0; i < 12; i++) {
            const time = new Date(startSlot.getTime() + i * 15 * 60000);
            slots.push(time);
        }
        return slots;
    }, [items]);

    const handlePlaceOrder = async () => {
        if (!selectedTime || !user) return;
        setIsPlacingOrder(true);
        let maxPrepTime = 15;
        items.forEach(cartItem => {
            if (cartItem.menuItem.preparationTime && cartItem.menuItem.preparationTime > maxPrepTime) {
                maxPrepTime = cartItem.menuItem.preparationTime;
            }
        });
        const estimatedPickupTime = Date.now() + (maxPrepTime * 60000);
        try {
            const newOrderId = await placeOrder({
                userId: user.userId,
                items,
                totalAmount: cartTotal,
                pickupTime: selectedTime.getTime(),
                estimatedPickupTime,
                paymentStatus: 'Unpaid',
                paymentMethod: 'Cash'
            });
            useCartStore.getState().clearCart();
            router.replace(`/(customer)/order-confirmation/${newOrderId}`);
        } catch (error) {
            console.error("Order failed", error);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Empty State
    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="cart-outline" size={60} color="#757575" />
                    </View>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Add some smoky deliciousness to get started</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.push('/(customer)/menu')}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.browseGradient}
                        >
                            <Text style={styles.browseText}>Browse Menu</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cart ({cartCount})</Text>
                <View style={{ width: 32 }} />
            </View>

            {/* Cart Items */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                {items.map((cartItem, index) => {
                    const item = cartItem.menuItem;
                    return (
                        <Animated.View key={item.itemId} entering={FadeInDown.delay(index * 100).duration(400)} style={styles.cartItem}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cartItemName}>{item.name}</Text>
                                {item.isCombo && item.comboItems && (
                                    <Text style={styles.cartItemCombo} numberOfLines={1}>
                                        {item.comboItems.join(' • ')}
                                    </Text>
                                )}
                                <Text style={styles.cartItemPrice}>{formatCurrency(item.price)}</Text>
                            </View>

                            {/* Stepper */}
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    onPress={() => decrementQuantity(item.itemId)}
                                    style={styles.stepperBtn}
                                >
                                    <Ionicons name="remove" size={16} color="#FF6A00" />
                                </TouchableOpacity>
                                <Text style={styles.stepperCount}>{cartItem.quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => incrementQuantity(item.itemId)}
                                    style={styles.stepperBtn}
                                >
                                    <Ionicons name="add" size={16} color="#FF6A00" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.cartItemTotal}>
                                {formatCurrency(item.price * cartItem.quantity)}
                            </Text>
                        </Animated.View>
                    );
                })}
            </ScrollView>

            {/* Bottom Checkout */}
            <View style={[styles.checkoutBar, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
                <TouchableOpacity
                    onPress={() => setTimePickerVisible(true)}
                    style={styles.timePicker}
                >
                    <Ionicons name="time-outline" size={22} color="#FF6A00" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.timeLabel}>{AppStrings.pickupTime}</Text>
                        <Text style={[styles.timeValue, !selectedTime && { color: '#757575' }]}>
                            {selectedTime ? formatTime(selectedTime) : AppStrings.selectPickupTime}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#757575" />
                </TouchableOpacity>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
                </View>

                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={!selectedTime || isPlacingOrder}
                    style={[styles.placeOrderBtn, (!selectedTime || isPlacingOrder) && { opacity: 0.5 }]}
                >
                    <LinearGradient
                        colors={['#FF6A00', '#E53B0A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.placeOrderGradient}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.placeOrderText}>
                            {isPlacingOrder ? 'Placing...' : AppStrings.placeOrder}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Time Picker Modal */}
            <Modal visible={isTimePickerVisible} transparent animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={() => setTimePickerVisible(false)}>
                    <Pressable style={[styles.modalContent, { paddingBottom: Math.max(32, insets.bottom + 16) }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>{AppStrings.selectPickupTime}</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time) => {
                                const isSelected = selectedTime?.getTime() === time.getTime();
                                return (
                                    <TouchableOpacity
                                        key={time.getTime()}
                                        onPress={() => {
                                            setSelectedTime(time);
                                            setTimePickerVisible(false);
                                        }}
                                        style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                                    >
                                        <Text style={[styles.timeSlotText, isSelected && { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
                                            {formatTime(time)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1818',
    },
    // Empty state
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIconBg: {
        marginBottom: 20,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginBottom: 28,
    },
    browseButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    browseGradient: {
        paddingHorizontal: 36,
        paddingVertical: 16,
        borderRadius: 14,
    },
    browseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 56,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
    },
    // Cart item
    cartItem: {
        backgroundColor: '#252121',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#353030',
    },
    cartItemName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 2,
    },
    cartItemCombo: {
        color: '#757575',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
    },
    cartItemPrice: {
        color: '#FF6A00',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1818',
        borderRadius: 12,
        paddingHorizontal: 4,
        paddingVertical: 4,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#353030',
    },
    stepperBtn: {
        padding: 6,
        paddingHorizontal: 8,
    },
    stepperCount: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        paddingHorizontal: 8,
    },
    cartItemTotal: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        width: 70,
        textAlign: 'right',
    },
    // Checkout bar
    checkoutBar: {
        backgroundColor: '#252121',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderColor: '#353030',
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1818',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#353030',
    },
    timeLabel: {
        color: '#A5A2A2',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    timeValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
    },
    totalValue: {
        color: '#FF6A00',
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
    },
    placeOrderBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    placeOrderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 14,
        gap: 8,
    },
    placeOrderText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Inter_700Bold',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#252121',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#757575',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 20,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    timeSlot: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#1A1818',
        borderWidth: 1,
        borderColor: '#353030',
    },
    timeSlotActive: {
        backgroundColor: '#FF6A00',
        borderColor: '#FF6A00',
    },
    timeSlotText: {
        color: '#A5A2A2',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
});
