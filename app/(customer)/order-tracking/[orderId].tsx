import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CartItem } from '../../../types/models';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useOrderStore } from '../../../store/orderStore';
import { OrderStatus, PaymentStatus } from '../../../constants/enums';
import { openUpiPayment, getMerchantUpiId } from '../../../utils/upiPayment';

const formatCurrency = (amount: number) => `₹${amount.toFixed(0)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ===== Stepper Progress Component =====
const OrderProgressStepper = ({ currentStatus }: { currentStatus: OrderStatus }) => {
    if (currentStatus === OrderStatus.CANCELLED) {
        return (
            <Animated.View entering={FadeInDown.duration(400)} style={stepperStyles.cancelledCard}>
                <View style={stepperStyles.cancelledIcon}>
                    <Ionicons name="close-circle" size={40} color="#EF5350" />
                </View>
                <Text style={stepperStyles.cancelledTitle}>Order Cancelled</Text>
                <Text style={stepperStyles.cancelledSubtitle}>This order has been cancelled. Please contact the shop for details.</Text>
            </Animated.View>
        );
    }

    const steps = [
        { icon: 'receipt-outline' as const, title: 'Placed', subtitle: 'Order received' },
        { icon: 'checkmark-circle-outline' as const, title: 'Accepted', subtitle: 'Shop confirmed' },
        { icon: 'restaurant-outline' as const, title: 'Preparing', subtitle: 'Cooking your food' },
        { icon: 'bag-check-outline' as const, title: 'Ready', subtitle: 'Ready for pickup' },
        { icon: 'checkmark-done-outline' as const, title: 'Done', subtitle: 'Order completed' },
    ];

    const getCurrentStepIndex = () => {
        switch (currentStatus) {
            case OrderStatus.PENDING: return 0;
            case OrderStatus.ACCEPTED: return 1;
            case OrderStatus.PREPARING: return 2;
            case OrderStatus.READY: return 3;
            case OrderStatus.COMPLETED: return 4;
            default: return 0;
        }
    };

    const currentIndex = getCurrentStepIndex();

    return (
        <View style={stepperStyles.container}>
            {steps.map((step, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === steps.length - 1;

                return (
                    <Animated.View key={step.title} entering={FadeInDown.delay(index * 100).duration(400)}>
                        <View style={stepperStyles.stepRow}>
                            <View
                                style={[
                                    stepperStyles.iconCircle,
                                    {
                                        backgroundColor: isActive ? `rgba(255, 106, 0, ${isCurrent ? 1 : 0.15})` : '#252121',
                                        borderColor: isCurrent ? 'rgba(255, 106, 0, 0.4)' : isActive ? 'rgba(255, 106, 0, 0.2)' : '#353030',
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={isActive ? (isCurrent ? '#FFFFFF' : '#FF6A00') : '#757575'}
                                />
                            </View>

                            <View style={stepperStyles.detailsContainer}>
                                <Text style={[
                                    stepperStyles.stepTitle,
                                    { color: isActive ? '#FFFFFF' : '#757575' }
                                ]}>
                                    {step.title}
                                </Text>
                                <Text style={[
                                    stepperStyles.stepSubtitle,
                                    isCurrent && { color: '#FF6A00' }
                                ]}>
                                    {step.subtitle}
                                </Text>
                            </View>

                            {isCurrent && (
                                <View style={stepperStyles.currentBadge}>
                                    <Text style={stepperStyles.currentBadgeText}>Current</Text>
                                </View>
                            )}
                        </View>

                        {!isLast && (
                            <View style={stepperStyles.lineContainer}>
                                <View
                                    style={[
                                        stepperStyles.line,
                                        { backgroundColor: index < currentIndex ? '#FF6A00' : '#353030' }
                                    ]}
                                />
                            </View>
                        )}
                    </Animated.View>
                );
            })}
        </View>
    );
};

const stepperStyles = StyleSheet.create({
    container: { width: '100%', paddingHorizontal: 16, marginTop: 10 },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    detailsContainer: { marginLeft: 16, flex: 1, justifyContent: 'center' },
    stepTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
    stepSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#A5A2A2' },
    lineContainer: { marginLeft: 21, paddingVertical: 4 },
    line: { width: 2, height: 28, borderRadius: 1 },
    currentBadge: {
        backgroundColor: 'rgba(255, 106, 0, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    currentBadgeText: { color: '#FF6A00', fontSize: 11, fontFamily: 'Inter_700Bold' },
    cancelledCard: {
        backgroundColor: 'rgba(239, 83, 80, 0.08)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 83, 80, 0.2)',
        marginHorizontal: 16,
        marginTop: 10,
    },
    cancelledIcon: { marginBottom: 12 },
    cancelledTitle: { color: '#EF5350', fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
    cancelledSubtitle: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});


// ===== Pay Now Card Component (for unpaid orders) =====
const PayNowCard = ({ order }: { order: any }) => {
    const [isOpeningUpi, setIsOpeningUpi] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const { updateOrderPayment } = useOrderStore();

    const handlePayViaApp = async () => {
        setIsOpeningUpi(true);
        await openUpiPayment(order.totalAmount, order.orderNumber || order.orderId);
        setIsOpeningUpi(false);
    };

    const handleIHavePaid = () => {
        Alert.alert(
            'Confirm Payment',
            `Did you successfully pay ₹${order.totalAmount.toFixed(0)} via UPI?`,
            [
                { text: 'No, Cancel', style: 'cancel' },
                {
                    text: 'Yes, I Paid',
                    onPress: async () => {
                        try {
                            await updateOrderPayment(order.orderId, {
                                paymentStatus: PaymentStatus.PAYMENT_INITIATED,
                                paymentMethod: 'UPI' as any,
                            });
                        } catch (err) {
                            console.error('[PayNow] Error updating payment:', err);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.payNowCard}>
            {/* Header */}
            <View style={styles.payNowHeader}>
                <View style={styles.payNowIconBox}>
                    <Ionicons name="wallet-outline" size={22} color="#FF6A00" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.payNowTitle}>Pay Online</Text>
                    <Text style={styles.payNowSubtitle}>Pay now via UPI for a faster pickup</Text>
                </View>
            </View>

            {/* Amount */}
            <View style={styles.payNowAmountRow}>
                <Text style={styles.payNowAmountLabel}>Amount Due</Text>
                <Text style={styles.payNowAmountValue}>{formatCurrency(order.totalAmount)}</Text>
            </View>

            {/* Pay via UPI App — Primary */}
            <TouchableOpacity
                style={styles.payViaAppBtn}
                onPress={handlePayViaApp}
                activeOpacity={0.85}
                disabled={isOpeningUpi}
            >
                <LinearGradient
                    colors={['#FF6A00', '#E53B0A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.payViaAppGradient}
                >
                    {isOpeningUpi ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="phone-portrait-outline" size={22} color="#FFFFFF" />
                            <Text style={styles.payViaAppText}>Pay ₹{order.totalAmount.toFixed(0)} via UPI App</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            {/* Toggle QR Fallback */}
            <TouchableOpacity
                style={styles.toggleQrBtn}
                onPress={() => setShowQR(!showQR)}
                activeOpacity={0.7}
            >
                <Ionicons name={showQR ? 'chevron-up' : 'qr-code-outline'} size={16} color="#757575" />
                <Text style={styles.toggleQrText}>
                    {showQR ? 'Hide QR Code' : 'Or scan QR code to pay'}
                </Text>
            </TouchableOpacity>

            {/* QR Code (collapsible) */}
            {showQR && (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.qrSection}>
                    <View style={styles.qrWrapper}>
                        <Image
                            source={require('../../../assets/Payment/Paytm_Qr.jpeg')}
                            style={{ width: 200, height: 200, borderRadius: 8 }}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                        />
                    </View>
                    <View style={styles.upiIdRow}>
                        <Ionicons name="at-outline" size={14} color="#757575" />
                        <Text style={styles.upiIdText}>UPI ID: {getMerchantUpiId()}</Text>
                    </View>
                </Animated.View>
            )}

            {/* I Have Paid */}
            <TouchableOpacity
                style={styles.iHavePaidBtn}
                onPress={handleIHavePaid}
                activeOpacity={0.8}
            >
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.iHavePaidText}>I Have Paid ₹{order.totalAmount.toFixed(0)}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


// ===== Main Screen =====
export default function OrderTrackingScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { orders, isLoading, subscribeToOrders } = useOrderStore();

    useEffect(() => {
        const unsub = subscribeToOrders();
        return unsub;
    }, []);

    const order = orders.find(o => o.orderId === orderId);
    const showPayNow = order &&
        order.paymentStatus !== PaymentStatus.PAID &&
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.COMPLETED;

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
                {order?.orderNumber ? `Order ${order.orderNumber}` : 'Track Order'}
            </Text>
            <View style={{ width: 40 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            {isLoading && !order ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A00" />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            ) : !order ? (
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#757575" />
                    <Text style={styles.notFoundTitle}>Order not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
                        <Text style={styles.goBackText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.badgeContainer}>
                        <StatusBadge status={order.status} />
                        {order.orderNumber && (
                            <Text style={styles.orderNumberLabel}>{order.orderNumber}</Text>
                        )}
                    </View>

                    <OrderProgressStepper currentStatus={order.status} />

                    {/* Order Details Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Order Details</Text>

                        {order.items.map((cartItem: CartItem, idx: number) => (
                            <View key={idx} style={styles.cartItemRow}>
                                <View style={styles.qtyBadge}>
                                    <Text style={styles.qtyText}>{cartItem.quantity}x</Text>
                                </View>
                                <Text style={styles.itemName}>{cartItem.menuItem.name}</Text>
                                <Text style={styles.itemPrice}>
                                    {formatCurrency(cartItem.menuItem.price * cartItem.quantity)}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                        </View>

                        {order.paymentStatus && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Payment</Text>
                                <View style={[
                                    styles.paymentBadge,
                                    { backgroundColor: order.paymentStatus === PaymentStatus.PAID ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 106, 0, 0.12)' }
                                ]}>
                                    <Ionicons
                                        name={order.paymentStatus === PaymentStatus.PAID ? 'checkmark-circle' : 'time-outline'}
                                        size={14}
                                        color={order.paymentStatus === PaymentStatus.PAID ? '#4CAF50' : '#FF6A00'}
                                    />
                                    <Text style={[
                                        styles.paymentBadgeText,
                                        { color: order.paymentStatus === PaymentStatus.PAID ? '#4CAF50' : '#FF6A00' }
                                    ]}>
                                        {order.paymentStatus === PaymentStatus.PAID
                                            ? `Paid via ${order.paymentMethod}`
                                            : order.paymentStatus === PaymentStatus.PAYMENT_INITIATED
                                                ? 'Payment Pending Verification'
                                                : 'Unpaid — Pay at Counter'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Pay Now Card — shown for ALL unpaid active orders */}
                    {showPayNow && <PayNowCard order={order} />}

                    {/* Paid Confirmation */}
                    {order.paymentStatus === PaymentStatus.PAID && (
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.paidCard}>
                            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                            <Text style={styles.paidText}>Payment Received ✓</Text>
                        </Animated.View>
                    )}

                    {/* Pickup Time & Date Card */}
                    <View style={styles.infoRow}>
                        <View style={[styles.infoCard, { flex: 1, marginRight: 8 }]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="time-outline" size={20} color="#FF6A00" />
                            </View>
                            <Text style={styles.infoLabel}>Pickup Time</Text>
                            <Text style={styles.infoValue}>{formatTime(order.pickupTime)}</Text>
                        </View>
                        <View style={[styles.infoCard, { flex: 1, marginLeft: 8 }]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="calendar-outline" size={20} color="#FF6A00" />
                            </View>
                            <Text style={styles.infoLabel}>Order Date</Text>
                            <Text style={styles.infoValue}>{formatDate(order.timestamp)}</Text>
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 56,
    },
    backBtn: { padding: 4, marginLeft: -8 },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_600SemiBold' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    loadingText: { color: '#757575', fontSize: 14, fontFamily: 'Inter_400Regular' },
    notFoundTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_600SemiBold' },
    goBackBtn: {
        backgroundColor: '#252121', paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 12, borderWidth: 1, borderColor: '#353030',
    },
    goBackText: { color: '#FF6A00', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    scrollContent: { padding: 20, paddingBottom: 120 },
    badgeContainer: { alignItems: 'center', marginBottom: 24, gap: 8 },
    orderNumberLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    card: {
        backgroundColor: '#252121', borderRadius: 16, padding: 20,
        marginTop: 24, borderWidth: 1, borderColor: '#353030',
    },
    cardTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 20 },
    cartItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    qtyBadge: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: '#1A1818',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
        borderWidth: 1, borderColor: '#353030',
    },
    qtyText: { color: '#FF6A00', fontSize: 12, fontFamily: 'Inter_700Bold' },
    itemName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_500Medium' },
    itemPrice: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    divider: { height: 1, backgroundColor: 'rgba(53, 48, 48, 0.5)', marginVertical: 16 },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    totalValue: { color: '#FF6A00', fontSize: 20, fontFamily: 'Inter_700Bold' },
    paymentRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(53, 48, 48, 0.5)',
    },
    paymentLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    paymentBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    paymentBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

    // Pay Now Card
    payNowCard: {
        backgroundColor: '#252121', borderRadius: 16, padding: 20,
        marginTop: 24, borderWidth: 1, borderColor: 'rgba(255, 106, 0, 0.25)',
    },
    payNowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    payNowIconBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    payNowTitle: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
    payNowSubtitle: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
    payNowAmountRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 106, 0, 0.06)', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255, 106, 0, 0.12)',
    },
    payNowAmountLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_500Medium' },
    payNowAmountValue: { color: '#FF6A00', fontSize: 22, fontFamily: 'Poppins_700Bold' },
    payViaAppBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
    payViaAppGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, paddingHorizontal: 20, gap: 10, borderRadius: 14,
    },
    payViaAppText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'center' },
    toggleQrBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 10,
    },
    toggleQrText: { color: '#757575', fontSize: 13, fontFamily: 'Inter_500Medium' },
    qrSection: { alignItems: 'center', paddingTop: 12 },
    qrWrapper: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 10 },
    upiIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    upiIdText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_500Medium' },
    iHavePaidBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, marginTop: 8,
        borderRadius: 12, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)',
        backgroundColor: 'rgba(76, 175, 80, 0.06)',
    },
    iHavePaidText: { color: '#4CAF50', fontSize: 15, fontFamily: 'Inter_700Bold' },

    // Paid Confirmation
    paidCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, backgroundColor: 'rgba(76, 175, 80, 0.08)',
        borderRadius: 14, paddingVertical: 16, marginTop: 24,
        borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    paidText: { color: '#4CAF50', fontSize: 16, fontFamily: 'Inter_700Bold' },

    // Info cards
    infoRow: { flexDirection: 'row', marginTop: 24, marginBottom: 40 },
    infoCard: {
        backgroundColor: '#252121', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#353030', alignItems: 'center',
    },
    infoIconBox: {
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        padding: 10, borderRadius: 12, marginBottom: 10,
    },
    infoLabel: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    infoValue: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
