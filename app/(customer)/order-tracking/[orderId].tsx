import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppColors } from '../../../constants/Colors';
import { Order, OrderStatus, CartItem } from '../../../types/models';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useOrderStore } from '../../../store/orderStore';

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

// Stepper Progress Component
const OrderProgressStepper = ({ currentStatus }: { currentStatus: OrderStatus }) => {

    const getCurrentStepIndex = () => {
        switch (currentStatus) {
            case OrderStatus.pending: return 0;
            case OrderStatus.preparing: return 1;
            case OrderStatus.ready: return 2;
            case OrderStatus.completed: return 3;
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
        <View>
            {steps.map((step, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.title}>
                        <View className="flex-row">
                            {/* Step Indicator */}
                            <View
                                className={`w-11 h-11 rounded-full items-center justify-center border-2 ${isCurrent ? 'border-primary/50' : 'border-transparent'
                                    }`}
                                style={{
                                    backgroundColor: isActive
                                        ? `rgba(240, 90, 40, ${isCurrent ? 1 : 0.2})`
                                        : AppColors.surfaceLight,
                                }}
                            >
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={isActive ? (isCurrent ? 'white' : AppColors.flameOrange) : AppColors.textMuted}
                                />
                            </View>

                            {/* Details */}
                            <View className="ml-4 justify-center flex-1">
                                <Text className={`font-[Outfit_600SemiBold] text-base ${isActive ? 'text-white' : 'text-textMuted'
                                    }`}>
                                    {step.title}
                                </Text>
                                <Text className="font-[Inter_400Regular] text-xs text-textSecondary mt-0.5">
                                    {step.subtitle}
                                </Text>
                            </View>
                        </View>

                        {/* Connector Line */}
                        {!isLast && (
                            <View className="ml-5">
                                <View
                                    className="w-[2px] h-8 rounded-full"
                                    style={{
                                        backgroundColor: index < currentIndex
                                            ? AppColors.flameOrange
                                            : AppColors.surfaceLight
                                    }}
                                />
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};


export default function OrderTrackingScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    const { orders } = useOrderStore();
    const order = orders.find(o => o.orderId === orderId);

    // Generate UPI URI
    const upiString = order ? encodeURIComponent(`upi://pay?pa=shop@upi&pn=NightFlame%20BBQ&am=${order.totalAmount}&cu=INR&tn=Order%20${order.orderId}`) : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${upiString}`;

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 h-14">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                <Ionicons name="chevron-back" size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-white font-[Outfit_600SemiBold] text-lg">
                Order {formatOrderIdShort(orderId || '')}
            </Text>
            <View className="w-10" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}

            {!order ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={AppColors.flameOrange} />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>

                    <View className="items-center mb-8">
                        <StatusBadge status={order.status} large />
                    </View>

                    <OrderProgressStepper currentStatus={order.status} />

                    {/* Order Details Card */}
                    <View className="bg-surfaceCard rounded-2xl border border-divider p-5 mt-10 mb-5">
                        <Text className="text-white font-[Outfit_600SemiBold] text-lg mb-5">
                            Order Details
                        </Text>

                        {order.items.map((cartItem: CartItem, idx: number) => (
                            <View key={idx} className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-lg bg-surfaceLight items-center justify-center mr-3">
                                    <Text className="text-primary font-[Outfit_700Bold] text-xs">
                                        {cartItem.quantity}x
                                    </Text>
                                </View>
                                <Text className="flex-1 text-white font-[Inter_500Medium] text-sm">
                                    {cartItem.menuItem.name}
                                </Text>
                                <Text className="text-textSecondary font-[Outfit_600SemiBold] text-sm">
                                    {formatCurrency(cartItem.menuItem.price * cartItem.quantity)}
                                </Text>
                            </View>
                        ))}

                        <View className="h-[1px] bg-divider my-4" />

                        <View className="flex-row items-center justify-between">
                            <Text className="text-white font-[Outfit_600SemiBold] text-base">
                                Total
                            </Text>
                            <Text className="text-primary font-[Outfit_700Bold] text-xl">
                                {formatCurrency(order.totalAmount)}
                            </Text>
                        </View>

                        {order.paymentStatus && (
                            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-divider/50">
                                <Text className="text-textSecondary font-[Outfit_600SemiBold] text-sm">
                                    Payment Status
                                </Text>
                                <Text className={`font-[Outfit_700Bold] text-sm ${order.paymentStatus === 'Paid' ? 'text-success' : 'text-error'}`}>
                                    {order.paymentStatus} {order.paymentStatus === 'Paid' ? `(${order.paymentMethod})` : ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Pay Now QR Code */}
                    {order.paymentStatus !== 'Paid' && (
                        <View className="bg-surfaceCard rounded-2xl border border-divider p-5 mb-5 items-center">
                            <Text className="text-white font-[Outfit_700Bold] text-lg mb-2">
                                Complete Payment
                            </Text>
                            <Text className="text-textSecondary font-[Inter_400Regular] text-xs mb-5 text-center px-4">
                                Scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to pay for your order.
                            </Text>
                            <View className="bg-white p-3 rounded-xl mb-3">
                                <Image
                                    source={{ uri: qrUrl }}
                                    style={{ width: 160, height: 160 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text className="text-primary font-[Outfit_800ExtraBold] text-xl">
                                {formatCurrency(order.totalAmount)}
                            </Text>
                        </View>
                    )}

                    {/* Pickup Time Card */}
                    <View className="bg-surfaceCard rounded-2xl border border-divider p-4 mb-10 flex-row items-center">
                        <View className="bg-primary/10 p-3 rounded-xl mr-4">
                            <Ionicons name="time-outline" size={24} color={AppColors.flameOrange} />
                        </View>
                        <View>
                            <Text className="text-textSecondary font-[Inter_400Regular] text-xs mb-1">
                                Pickup Time
                            </Text>
                            <Text className="text-white font-[Outfit_600SemiBold] text-base">
                                {formatTime(order.pickupTime)}
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
