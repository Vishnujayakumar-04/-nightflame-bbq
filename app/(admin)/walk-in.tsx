import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { useMenuStore } from '../../store/menuStore';
import { useOrderStore } from '../../store/orderStore';
import { CartItem, OrderStatus, MenuItem } from '../../types/models';

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

export default function WalkInOrderScreen() {
    const router = useRouter();
    const { menuItems, isLoading: menuLoading, subscribeToMenu } = useMenuStore();
    const { placeOrder } = useOrderStore();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unsub = subscribeToMenu();
        return () => unsub();
    }, []);

    const addToCart = (item: MenuItem) => {
        const existing = cart.find(c => c.menuItem.itemId === item.itemId);
        if (existing) {
            setCart(cart.map(c =>
                c.menuItem.itemId === item.itemId
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ));
        } else {
            setCart([...cart, { menuItem: item, quantity: 1 }]);
        }
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(cart.map(c => {
            if (c.menuItem.itemId === itemId) {
                const newQty = c.quantity + delta;
                return newQty > 0 ? { ...c, quantity: newQty } : c;
            }
            return c;
        }).filter(c => c.quantity > 0));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.menuItem.price), 0);

    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            Alert.alert("Error", "Cart is empty!");
            return;
        }

        if (paymentMethod === 'UPI' && !transactionId.trim()) {
            Alert.alert("Missing Info", "Please enter the UPI Transaction ID.");
            return;
        }

        setSubmitting(true);
        try {
            const maxPrepTime = cart.reduce((max, item) => {
                const prep = item.menuItem.preparationTime || 0;
                return prep > max ? prep : max;
            }, 0);

            await placeOrder({
                userId: null,
                customerName: customerName || 'Walk-in',
                items: cart,
                totalAmount,
                paymentStatus: 'Paid',
                paymentMethod,
                transactionId: paymentMethod === 'UPI' ? transactionId : undefined,
                pickupTime: Date.now(),
                estimatedPickupTime: Date.now() + (maxPrepTime * 60000),
                paidAt: Date.now()
            });

            Alert.alert("Success", "Walk-in order created and paid!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert("Error", "Failed to create order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (menuLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color={AppColors.flameOrange} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-row items-center px-6 py-4 border-b border-divider">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-[Outfit_700Bold] text-2xl">New Walk-in Order</Text>
            </View>

            <View className="flex-1 flex-row">
                {/* Left Side: Menu Items Menu */}
                <ScrollView className="w-1/2 border-r border-divider p-4">
                    <Text className="text-white/70 font-[Outfit_600SemiBold] mb-4">Select Items</Text>
                    {menuItems.map(item => (
                        <TouchableOpacity
                            key={item.itemId}
                            onPress={() => addToCart(item)}
                            className="bg-surfaceCard p-4 rounded-xl mb-3 flex-row justify-between items-center border border-divider"
                        >
                            <Text className="text-white font-[Inter_500Medium]">{item.name}</Text>
                            <Text className="text-primary font-[Outfit_700Bold]">{formatCurrency(item.price)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Right Side: Cart Summary */}
                <ScrollView className="w-1/2 p-4">
                    <Text className="text-white/70 font-[Outfit_600SemiBold] mb-4">Cart & Checkout</Text>

                    {cart.map(item => (
                        <View key={item.menuItem.itemId} className="flex-row items-center justify-between mb-3 bg-surfaceLight p-3 rounded-lg border border-divider">
                            <View className="flex-1 mr-2">
                                <Text className="text-white font-[Inter_500Medium]" numberOfLines={1}>{item.menuItem.name}</Text>
                                <Text className="text-primary font-[Outfit_600SemiBold] mt-1">{formatCurrency(item.quantity * item.menuItem.price)}</Text>
                            </View>
                            <View className="flex-row items-center bg-background rounded-full">
                                <TouchableOpacity onPress={() => updateQuantity(item.menuItem.itemId, -1)} className="p-2">
                                    <Ionicons name="remove" size={16} color="white" />
                                </TouchableOpacity>
                                <Text className="text-white font-[Inter_600SemiBold] mx-2">{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.menuItem.itemId, 1)} className="p-2">
                                    <Ionicons name="add" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {cart.length > 0 && (
                        <View className="mt-4 pt-4 border-t border-divider">
                            <Text className="text-white/60 text-xs mb-1">Customer Name (Optional)</Text>
                            <TextInput
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholder="Walk-in Customer"
                                placeholderTextColor={AppColors.textMuted}
                                className="bg-surfaceLight text-white px-4 py-3 rounded-xl font-[Inter_500Medium] mb-4 border border-divider"
                            />

                            <Text className="text-white/60 text-xs mb-1">Payment Method</Text>
                            <View className="flex-row mb-4">
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod('Cash')}
                                    className={`flex-1 py-3 rounded-l-xl border flex-row justify-center items-center ${paymentMethod === 'Cash' ? 'bg-primary border-primary' : 'bg-surfaceLight border-divider'}`}
                                >
                                    <Ionicons name="cash-outline" size={18} color={paymentMethod === 'Cash' ? 'white' : AppColors.textMuted} className="mr-2" />
                                    <Text className={`font-[Outfit_600SemiBold] ${paymentMethod === 'Cash' ? 'text-white' : 'text-textMuted'}`}>Cash</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod('UPI')}
                                    className={`flex-1 py-3 rounded-r-xl border flex-row justify-center items-center ${paymentMethod === 'UPI' ? 'bg-primary border-primary' : 'bg-surfaceLight border-divider'}`}
                                >
                                    <Ionicons name="qr-code-outline" size={18} color={paymentMethod === 'UPI' ? 'white' : AppColors.textMuted} className="mr-2" />
                                    <Text className={`font-[Outfit_600SemiBold] ${paymentMethod === 'UPI' ? 'text-white' : 'text-textMuted'}`}>UPI</Text>
                                </TouchableOpacity>
                            </View>

                            {paymentMethod === 'UPI' && (
                                <TextInput
                                    value={transactionId}
                                    onChangeText={setTransactionId}
                                    placeholder="Enter UPI Transaction ID"
                                    placeholderTextColor={AppColors.textMuted}
                                    className="bg-surfaceLight text-white px-4 py-3 rounded-xl font-[Inter_500Medium] mb-4 border border-divider"
                                />
                            )}

                            <View className="flex-row justify-between items-center mt-2 mb-6">
                                <Text className="text-white/80 font-[Outfit_600SemiBold] text-lg">Total:</Text>
                                <Text className="text-primary font-[Outfit_800ExtraBold] text-2xl">{formatCurrency(totalAmount)}</Text>
                            </View>

                            <TouchableOpacity
                                onPress={handleCreateOrder}
                                disabled={submitting}
                                className="bg-success py-4 rounded-xl items-center shadow-lg shadow-success/40"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-[Outfit_700Bold] text-lg">Complete Order</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
