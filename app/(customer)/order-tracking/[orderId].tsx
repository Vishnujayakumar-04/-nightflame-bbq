import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CartItem } from '../../../types/models';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useOrderStore } from '../../../store/orderStore';
import { OrderStatus, PaymentStatus } from '../../../constants/enums';

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatOrderIdShort = (id: string) => `#NF-${id.substring(0, 3).toUpperCase()}`;

// Stepper Progress Component
const OrderProgressStepper = ({ currentStatus }: { currentStatus: OrderStatus }) => {
    const getCurrentStepIndex = () => {
        switch (currentStatus) {
            case OrderStatus.PENDING: return 0;
            case OrderStatus.PREPARING: return 1;
            case OrderStatus.READY: return 2;
            case OrderStatus.COMPLETED: return 3;
            default: return 0;
        }
    };

    const currentIndex = getCurrentStepIndex();

    const steps = [
        { icon: 'receipt-outline' as const, title: 'Placed', subtitle: 'Order received' },
        { icon: 'restaurant-outline' as const, title: 'Preparing', subtitle: 'Cooking your food' },
        { icon: 'checkmark-circle-outline' as const, title: 'Ready', subtitle: 'Ready for pickup' },
        { icon: 'checkmark-done-outline' as const, title: 'Done', subtitle: 'Order completed' },
    ];

    return (
        <View style={stepperStyles.container}>
            {steps.map((step, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.title}>
                        <View style={stepperStyles.stepRow}>
                            {/* Step Indicator */}
                            <View
                                style={[
                                    stepperStyles.iconCircle,
                                    {
                                        backgroundColor: isActive ? `rgba(255, 106, 0, ${isCurrent ? 1 : 0.15})` : '#252121',
                                        borderColor: isCurrent ? 'rgba(255, 106, 0, 0.4)' : 'transparent',
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={isActive ? (isCurrent ? '#FFFFFF' : '#FF6A00') : '#757575'}
                                />
                            </View>

                            {/* Details */}
                            <View style={stepperStyles.detailsContainer}>
                                <Text style={[
                                    stepperStyles.stepTitle,
                                    { color: isActive ? '#FFFFFF' : '#757575' }
                                ]}>
                                    {step.title}
                                </Text>
                                <Text style={stepperStyles.stepSubtitle}>
                                    {step.subtitle}
                                </Text>
                            </View>
                        </View>

                        {/* Connector Line */}
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
                    </View>
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
    line: { width: 2, height: 32, borderRadius: 1 },
});


export default function OrderTrackingScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    const { orders } = useOrderStore();
    const order = orders.find(o => o.orderId === orderId);




    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
                Order {formatOrderIdShort(orderId || '')}
            </Text>
            <View style={{ width: 40 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            {!order ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A00" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.badgeContainer}>
                        <StatusBadge status={order.status} />
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
                                <Text style={styles.paymentLabel}>Payment Status</Text>
                                <Text style={[
                                    styles.paymentValue,
                                    { color: order.paymentStatus === PaymentStatus.PAID ? '#4CAF50' : '#EF5350' }
                                ]}>
                                    {order.paymentStatus} {order.paymentStatus === PaymentStatus.PAID ? `(${order.paymentMethod})` : ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Pay Now QR Code */}
                    {order.paymentStatus !== PaymentStatus.PAID && (
                        <View style={[styles.card, { alignItems: 'center' }]}>
                            <Text style={styles.qrTitle}>Complete Payment</Text>
                            <Text style={styles.qrSubtitle}>
                                Scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to pay for your order.
                            </Text>
                            <View style={styles.qrWrapper}>
                                <Image
                                    source={require('../../../assets/Payment/IMG_20260305_105900.png')}
                                    style={{ width: 240, height: 240, borderRadius: 8 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.qrAmount}>{formatCurrency(order.totalAmount)}</Text>
                        </View>
                    )}

                    {/* Pickup Time Card */}
                    <View style={styles.pickupCard}>
                        <View style={styles.pickupIcon}>
                            <Ionicons name="time-outline" size={24} color="#FF6A00" />
                        </View>
                        <View>
                            <Text style={styles.pickupLabel}>Pickup Time</Text>
                            <Text style={styles.pickupValue}>{formatTime(order.pickupTime)}</Text>
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
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: 20, paddingBottom: 120 },
    badgeContainer: { alignItems: 'center', marginBottom: 24 },
    card: {
        backgroundColor: '#252121', borderRadius: 16, padding: 20,
        marginTop: 32, marginBottom: 20, borderWidth: 1, borderColor: '#353030',
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
    paymentValue: { fontSize: 13, fontFamily: 'Inter_700Bold' },
    qrTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 8 },
    qrSubtitle: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 },
    qrWrapper: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 16 },
    qrImage: { width: 160, height: 160 },
    qrAmount: { color: '#FF6A00', fontSize: 24, fontFamily: 'Poppins_700Bold' },
    pickupCard: {
        backgroundColor: '#252121', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#353030',
        marginBottom: 40,
    },
    pickupIcon: {
        backgroundColor: 'rgba(255, 106, 0, 0.1)', padding: 12, borderRadius: 12, marginRight: 16,
    },
    pickupLabel: { color: '#A5A2A2', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    pickupValue: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
