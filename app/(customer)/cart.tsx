import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, StyleSheet, PanResponder } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence, runOnJS, interpolate, Extrapolation } from 'react-native-reanimated';

import { AppStrings } from '../../constants/Strings';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useShopStore } from '../../store/shopStore';
import { LinearGradient } from 'expo-linear-gradient';
import { PaymentQRModal } from '../../components/PaymentQRModal';
import { PaymentSelectionModal } from '../../components/PaymentSelectionModal';

import { PaymentType, PaymentStatus, PaymentMethod } from '../../constants/enums';
import { getMenuItemImage } from '../../constants/menuImages';
import { formatCurrency, formatTime } from '../../utils/formatters';



const SLIDER_HEIGHT = 60;
const THUMB_SIZE = 52;

const SlideToOrder = ({ onComplete }: { onComplete: () => void }) => {
    const translateX = useSharedValue(0);
    const isCompleted = useSharedValue(0);
    const hintOpacity = useSharedValue(1);
    const [trackWidth, setTrackWidth] = useState(0);
    const maxSlideRef = useRef(200);

    // Keep the ref in sync with trackWidth
    useEffect(() => {
        if (trackWidth > 0) {
            maxSlideRef.current = trackWidth - THUMB_SIZE - 8;
        }
    }, [trackWidth]);

    // Start pulsing hint arrows
    useEffect(() => {
        hintOpacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 800 }),
                withTiming(1, { duration: 800 }),
            ),
            -1,
            true
        );
    }, []);

    const handleComplete = useCallback(() => {
        onComplete();
    }, [onComplete]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
            onPanResponderMove: (_, gestureState) => {
                const max = maxSlideRef.current;
                const newX = Math.max(0, Math.min(gestureState.dx, max));
                translateX.value = newX;
            },
            onPanResponderRelease: (_, gestureState) => {
                const max = maxSlideRef.current;
                const threshold = max * 0.8;
                if (gestureState.dx >= threshold) {
                    translateX.value = withSpring(max);
                    isCompleted.value = withTiming(1, { duration: 300 });
                    runOnJS(handleComplete)();
                } else {
                    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
                }
            },
        })
    ).current;

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const hintStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [0, 60],
            [hintOpacity.value, 0],
            Extrapolation.CLAMP
        ),
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [0, 80],
            [1, 0],
            Extrapolation.CLAMP
        ),
    }));

    const checkStyle = useAnimatedStyle(() => ({
        opacity: isCompleted.value,
        transform: [{ scale: interpolate(isCompleted.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) }],
    }));

    return (
        <View
            style={sliderStyles.container}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
            <LinearGradient
                colors={['rgba(255,106,0,0.15)', 'rgba(229,59,10,0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={sliderStyles.track}
            >
                {/* Hint arrows */}
                <Animated.View style={[sliderStyles.hintContainer, hintStyle]}>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,106,0,0.4)" />
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,106,0,0.6)" style={{ marginLeft: -6 }} />
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,106,0,0.8)" style={{ marginLeft: -6 }} />
                </Animated.View>

                {/* Text label */}
                <Animated.Text style={[sliderStyles.label, textStyle]}>
                    Slide to Place Order
                </Animated.Text>

                {/* Success check */}
                <Animated.View style={[sliderStyles.checkContainer, checkStyle]}>
                    <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                    <Text style={sliderStyles.checkText}>Order Placed!</Text>
                </Animated.View>

                {/* Draggable Thumb */}
                <Animated.View
                    style={[sliderStyles.thumb, thumbStyle]}
                    {...panResponder.panHandlers}
                >
                    <LinearGradient
                        colors={['#FF6A00', '#E53B0A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={sliderStyles.thumbGradient}
                    >
                        <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                    </LinearGradient>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const sliderStyles = StyleSheet.create({
    container: {
        marginTop: 20,
        height: SLIDER_HEIGHT,
        width: '100%',
    },
    track: {
        flex: 1,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(255,106,0,0.3)',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingHorizontal: 4,
    },
    thumb: {
        position: 'absolute',
        left: 4,
        top: 4,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        zIndex: 10,
    },
    thumbGradient: {
        width: '100%',
        height: '100%',
        borderRadius: THUMB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    label: {
        color: '#FF6A00',
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    hintContainer: {
        position: 'absolute',
        left: THUMB_SIZE + 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkContainer: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkText: {
        color: '#4CAF50',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
});

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const items = useCartStore(state => state.items);
    const incrementQuantity = useCartStore(state => state.incrementQuantity);
    const decrementQuantity = useCartStore(state => state.decrementQuantity);
    const getCartTotal = useCartStore(state => state.getCartTotal);
    const getItemCount = useCartStore(state => state.getItemCount);
    const clearCart = useCartStore(state => state.clearCart);

    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isQRVisible, setQRVisible] = useState(false);
    const [isPaymentSelectionVisible, setPaymentSelectionVisible] = useState(false);
    const [isBillSummaryVisible, setBillSummaryVisible] = useState(false);

    const { user } = useAuthStore();
    const placeOrder = useOrderStore(state => state.placeOrder);
    const { status, subscribeToStatus } = useShopStore();
    const cartTotal = getCartTotal();
    const cartCount = getItemCount();

    // Subscribe to shop status to block checkout aggressively
    useEffect(() => {
        const unsubStatus = subscribeToStatus();
        return () => unsubStatus();
    }, []);

    const timeSlots = useMemo(() => {
        const slots: Date[] = [];
        const now = new Date();

        // Helper to parse "06:00 PM" into minutes from midnight
        const parseTimeStr = (timeStr: string | undefined, fallback: number) => {
            if (!timeStr) return fallback;
            try {
                const [time, modifier] = timeStr.split(' ');
                const parts = time.split(':').map(Number);
                let hours = parts[0];
                const minutes = parts[1] || 0;
                if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
            } catch {
                return fallback;
            }
        };

        // Default: 6 PM open, 11 PM close
        const openMin = parseTimeStr(status?.openTime, 18 * 60);
        const closeMin = parseTimeStr(status?.closeTime, 23 * 60);

        // Calculate max prep time from cart items
        let maxPrepTime = 15;
        items.forEach(cartItem => {
            if (cartItem.menuItem.preparationTime && cartItem.menuItem.preparationTime > maxPrepTime) {
                maxPrepTime = cartItem.menuItem.preparationTime;
            }
        });

        // The earliest the order can be ready
        const minPickupTime = new Date(now.getTime() + maxPrepTime * 60000);

        // Build today's shop opening time as a Date
        const shopOpenDate = new Date(now);
        shopOpenDate.setHours(Math.floor(openMin / 60), openMin % 60, 0, 0);

        // If user is browsing before shop opens, start slots from shop opening time + prep
        // If user is browsing during shop hours, start from now + prep
        const effectiveStart = minPickupTime.getTime() < shopOpenDate.getTime()
            ? new Date(shopOpenDate.getTime() + maxPrepTime * 60000)
            : minPickupTime;

        // Align to next 15-minute boundary
        const startSlot = new Date(effectiveStart);
        startSlot.setSeconds(0, 0);
        const rem = startSlot.getMinutes() % 15;
        if (rem !== 0) {
            startSlot.setMinutes(startSlot.getMinutes() + (15 - rem));
        }

        // Generate slots (up to 20 slots = 5 hours), within shop closing time
        for (let i = 0; i < 20; i++) {
            const slotTime = new Date(startSlot.getTime() + i * 15 * 60000);
            const slotMin = slotTime.getHours() * 60 + slotTime.getMinutes();

            // Must be within shop hours
            if (slotMin >= openMin && slotMin <= closeMin) {
                slots.push(slotTime);
            }
            // Stop completely if past closing time
            if (slotMin > closeMin) break;
        }

        return slots;
    }, [items, status]);

    const handlePlaceOrder = async (paymentType: PaymentType) => {
        if (!selectedTime || !user) return;
        setIsPlacingOrder(true);

        try {
            const newOrderId = await placeOrder({
                userId: user.userId,
                customerName: user.name,
                phoneNumber: user.phoneNumber,
                items,
                totalAmount: cartTotal,
                pickupTime: selectedTime.getTime(),
                paymentType,
                paymentStatus: paymentType === PaymentType.PAY_NOW ? PaymentStatus.PAYMENT_INITIATED : PaymentStatus.UNPAID,
                paymentMethod: paymentType === PaymentType.PAY_NOW ? PaymentMethod.UPI : null,
                notificationShown: false,
                isLocked: false,
                lockedBy: null,
            } as any);
            useCartStore.getState().clearCart();
            setQRVisible(false);
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
            <LinearGradient colors={['#1A1818', '#1D1510']} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#1A1818', '#1D1510']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart ({cartCount})</Text>
                    <TouchableOpacity onPress={() => {
                        clearCart();
                    }} style={styles.removeAllBtn}>
                        <Ionicons name="trash-outline" size={16} color="#EF5350" />
                        <Text style={styles.removeAllText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 180 }}>
                    {items.map((cartItem, index) => {
                        const item = cartItem.menuItem;
                        const localImg = getMenuItemImage(item.name);

                        return (
                            <Animated.View key={cartItem.cartItemId} entering={FadeInDown.delay(index * 100).duration(400)} style={styles.cartItem}>
                                {/* Item Image */}
                                <View style={styles.cartItemImageContainer}>
                                    {item.imageUrl ? (
                                        <Image source={{ uri: item.imageUrl }} placeholder={require('../../assets/logo_brand.png')} style={styles.cartItemImage} contentFit="cover" transition={300} cachePolicy="memory-disk" />
                                    ) : localImg ? (
                                        <Image source={localImg} style={styles.cartItemImage} contentFit="cover" />
                                    ) : (
                                        <View style={[styles.cartItemImage, { backgroundColor: '#353030', alignItems: 'center', justifyContent: 'center' }]}>
                                            <Ionicons name="restaurant" size={20} color="#757575" />
                                        </View>
                                    )}
                                </View>

                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                                    
                                    {/* Add-ons */}
                                    {cartItem.selectedAddOns && cartItem.selectedAddOns.length > 0 && (
                                        <View style={{ marginTop: 2, marginBottom: 2 }}>
                                            {cartItem.selectedAddOns.map(addon => (
                                                <Text key={addon.name} style={{ color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                                                    + {addon.quantity}x {addon.name} (₹{addon.price * addon.quantity})
                                                </Text>
                                            ))}
                                        </View>
                                    )}

                                    {item.isCombo && item.comboItems && (
                                        <Text style={styles.cartItemCombo} numberOfLines={1}>
                                            {item.comboItems.join(' • ')}
                                        </Text>
                                    )}
                                    {cartItem.specialInstructions ? (
                                        <View style={styles.instructionBadge}>
                                            <Text style={styles.instructionText} numberOfLines={1}>
                                                {cartItem.specialInstructions}
                                            </Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.cartItemPriceRow}>
                                        <Text style={styles.cartItemPriceEach}>{formatCurrency(item.price)}</Text>
                                        <Text style={styles.cartItemTotalItem}>
                                            {formatCurrency((item.price + (cartItem.selectedAddOns?.reduce((sum, a) => sum + (a.price * a.quantity), 0) || 0)) * cartItem.quantity)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Stepper */}
                                <View style={styles.stepper}>
                                    <TouchableOpacity
                                        onPress={() => decrementQuantity(cartItem.cartItemId)}
                                        style={styles.stepperBtn}
                                    >
                                        <Ionicons name="remove" size={14} color="#FF6A00" />
                                    </TouchableOpacity>
                                    <Text style={styles.stepperCount}>{cartItem.quantity}</Text>
                                    <TouchableOpacity
                                        onPress={() => incrementQuantity(cartItem.cartItemId)}
                                        style={styles.stepperBtn}
                                    >
                                        <Ionicons name="add" size={14} color="#FF6A00" />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* Bottom Checkout */}
                <View style={[styles.checkoutBar, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>

                    {!status?.isOpen ? (
                        <View style={styles.closedMessageContainer}>
                            <Ionicons name="moon" size={20} color="#EF5350" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.closedMessageText}>
                                    {status?.message || "Shop is currently closed"}
                                </Text>
                                <Text style={styles.cartOpensAtText}>
                                    Scheduled to open at {status?.openTime || '6:00 PM'}
                                </Text>
                            </View>
                        </View>
                    ) : (
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
                    )}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.viewBillBtn, (!status?.isOpen || !selectedTime || isPlacingOrder) && { opacity: 0.4 }]}
                        activeOpacity={0.85}
                        onPress={() => setBillSummaryVisible(true)}
                        disabled={!status?.isOpen || !selectedTime || isPlacingOrder}
                    >
                        <LinearGradient
                            colors={['#353030', '#252121']}
                            style={styles.viewBillGradient}
                        >
                            <Text style={styles.viewBillText}>View Bill</Text>
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
                                {timeSlots.length === 0 ? (
                                    <View style={{ width: '100%', alignItems: 'center', paddingVertical: 32 }}>
                                        <Ionicons name="time-outline" size={40} color="#353030" />
                                        <Text style={{ color: '#757575', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 12, textAlign: 'center' }}>
                                            No pickup slots available right now
                                        </Text>
                                        <Text style={{ color: '#555', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 6, textAlign: 'center', paddingHorizontal: 16 }}>
                                            The shop opens at {status?.openTime || '06:00 PM'}. Pickup times will appear during operating hours.
                                        </Text>
                                    </View>
                                ) : (
                                    timeSlots.map((time) => {
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
                                    })
                                )}
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* UPI Payment Modal */}
                <PaymentQRModal
                    visible={isQRVisible}
                    amount={cartTotal}
                    orderId={`BQ-${Date.now()}`}
                    isLoading={isPlacingOrder}
                    onClose={() => setQRVisible(false)}
                    onPaid={() => handlePlaceOrder(PaymentType.PAY_NOW)}
                />

                {/* Payment Selection Modal */}
                <PaymentSelectionModal
                    visible={isPaymentSelectionVisible}
                    onClose={() => setPaymentSelectionVisible(false)}
                    onSelectPayNow={() => {
                        setPaymentSelectionVisible(false);
                        setTimeout(() => setQRVisible(true), 150);
                    }}
                    onSelectPayLater={() => {
                        setPaymentSelectionVisible(false);
                        handlePlaceOrder(PaymentType.PAY_LATER);
                    }}
                    isShopOpen={!!status?.isOpen}
                    isSubmitting={isPlacingOrder}
                />

                {/* Bill Summary Modal */}
                <Modal visible={isBillSummaryVisible} transparent animationType="slide">
                    <Pressable style={styles.modalOverlay} onPress={() => setBillSummaryVisible(false)}>
                        <Pressable style={[styles.billModalContent, { paddingBottom: Math.max(32, insets.bottom + 16) }]} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.billTitle}>🧾 Order Summary</Text>

                            {/* Itemized List */}
                            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                                {items.map((cartItem) => {
                                    const item = cartItem.menuItem;
                                    return (
                                        <View key={item.itemId} style={styles.billRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.billItemName}>{item.name}</Text>
                                                {cartItem.specialInstructions ? (
                                                    <Text style={[styles.billItemQty, { color: '#FF6A00', fontSize: 11 }]}>
                                                        {cartItem.specialInstructions}
                                                    </Text>
                                                ) : null}
                                                <Text style={styles.billItemQty}>{formatCurrency(item.price)} × {cartItem.quantity}</Text>
                                            </View>
                                            <Text style={styles.billItemTotal}>
                                                {formatCurrency(item.price * cartItem.quantity)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Divider */}
                            <View style={styles.billDivider} />

                            {/* Subtotal */}
                            <View style={styles.billSummaryRow}>
                                <Text style={styles.billSummaryLabel}>Total Amount</Text>
                                <Text style={styles.billSummaryValue}>{formatCurrency(cartTotal)}</Text>
                            </View>

                            {/* Grand Total */}
                            <View style={[styles.billDivider, { marginTop: 12 }]} />
                            <View style={[styles.billSummaryRow, { marginTop: 12 }]}>
                                <Text style={styles.billGrandLabel}>Grand Total</Text>
                                <Text style={styles.billGrandValue}>{formatCurrency(cartTotal)}</Text>
                            </View>

                            {/* Pickup Time */}
                            {selectedTime && (
                                <View style={styles.billPickupRow}>
                                    <Ionicons name="time-outline" size={16} color="#FF6A00" />
                                    <Text style={styles.billPickupText}>Pickup at {formatTime(selectedTime)}</Text>
                                </View>
                            )}

                            {/* Slide to Place Order */}
                            <SlideToOrder
                                onComplete={() => {
                                    setBillSummaryVisible(false);
                                    setTimeout(() => setPaymentSelectionVisible(true), 200);
                                }}
                            />
                        </Pressable>
                    </Pressable>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontFamily: 'Urbanist_700Bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Urbanist_400Regular',
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
        fontFamily: 'Urbanist_700Bold',
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
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        fontStyle: 'italic',
    },
    // Cart item
    cartItem: {
        backgroundColor: '#252121',
        padding: 12,
        borderRadius: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#353030',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cartItemImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#353030',
    },
    cartItemImage: {
        width: '100%',
        height: '100%',
    },
    cartItemName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Urbanist_700Bold',
        marginBottom: 2,
    },
    cartItemCombo: {
        color: '#757575',
        fontSize: 11,
        fontFamily: 'Urbanist_400Regular',
        marginBottom: 4,
    },
    instructionBadge: {
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    instructionText: {
        color: '#FF6A00',
        fontSize: 10,
        fontFamily: 'Urbanist_600SemiBold',
    },
    cartItemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cartItemPriceEach: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Urbanist_400Regular',
    },
    cartItemTotalItem: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Urbanist_700Bold',
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1818',
        borderRadius: 12,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#353030',
    },
    stepperBtn: {
        padding: 6,
        paddingHorizontal: 8,
    },
    stepperCount: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Urbanist_800ExtraBold',
        paddingHorizontal: 2,
    },
    // Checkout bar
    checkoutBar: {
        backgroundColor: '#1A1818',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderColor: '#252121',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252121',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#353030',
    },
    timeLabel: {
        color: '#757575',
        fontSize: 10,
        fontFamily: 'Urbanist_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timeValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Urbanist_700Bold',
        marginTop: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Urbanist_600SemiBold',
    },
    totalValue: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Urbanist_800ExtraBold',
    },
    viewBillBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
    },
    viewBillGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBillText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Urbanist_700Bold',
    },
    placeOrderBtn: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    placeOrderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 18,
        gap: 10,
    },
    placeOrderText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Urbanist_800ExtraBold',
        letterSpacing: 0.5,
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
        fontFamily: 'Urbanist_600SemiBold',
        marginBottom: 20,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeSlot: {
        width: '23%',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#1A1818',
        borderWidth: 1,
        borderColor: '#353030',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeSlotActive: {
        backgroundColor: '#FF6A00',
        borderColor: '#FF6A00',
        elevation: 4,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    timeSlotText: {
        color: '#A5A2A2',
        fontFamily: 'Urbanist_600SemiBold',
        fontSize: 13,
        textAlign: 'center',
    },
    closedMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(239, 83, 80, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 83, 80, 0.3)',
        marginBottom: 20,
        gap: 12,
    },
    closedMessageText: {
        color: '#EF5350',
        fontSize: 14,
        fontFamily: 'Urbanist_600SemiBold',
    },
    cartOpensAtText: {
        color: 'rgba(239, 83, 80, 0.7)',
        fontSize: 12,
        fontFamily: 'Urbanist_400Regular',
        marginTop: 2,
    },
    // Bill Summary Modal
    billModalContent: {
        backgroundColor: '#1A1818',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
    },
    billTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Urbanist_700Bold',
        marginBottom: 20,
    },
    billRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(53, 48, 48, 0.4)',
    },
    billItemName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Urbanist_600SemiBold',
        marginBottom: 2,
    },
    billItemQty: {
        color: '#757575',
        fontSize: 12,
        fontFamily: 'Urbanist_400Regular',
    },
    billItemTotal: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Urbanist_700Bold',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#353030',
        marginVertical: 8,
    },
    billSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    billSummaryLabel: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Urbanist_400Regular',
    },
    billSummaryValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Urbanist_600SemiBold',
    },
    billGrandLabel: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Urbanist_700Bold',
    },
    billGrandValue: {
        color: '#FF6A00',
        fontSize: 24,
        fontFamily: 'Urbanist_700Bold',
    },
    billPickupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#252121',
        padding: 14,
        borderRadius: 14,
        marginTop: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#353030',
    },
    billPickupText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Urbanist_600SemiBold',
    },
    removeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 83, 80, 0.12)',
    },
    removeAllText: {
        color: '#EF5350',
        fontSize: 12,
        fontFamily: 'Urbanist_600SemiBold',
    },
});
