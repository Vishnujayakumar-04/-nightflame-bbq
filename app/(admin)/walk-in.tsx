import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { MenuItem } from '../../types/models';
import { useMenuStore } from '../../store/menuStore';
import { useOrderStore } from '../../store/orderStore';

const formatCurrency = (amount: number) => `₹${amount}`;

interface WalkInItem {
    menuItem: MenuItem;
    quantity: number;
}

export default function WalkInOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { menuItems, subscribeToMenu } = useMenuStore();
    const placeOrder = useOrderStore(state => state.placeOrder);

    const [step, setStep] = useState<1 | 2>(1);
    const [search, setSearch] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [selectedItems, setSelectedItems] = useState<WalkInItem[]>([]);
    const [isPlacing, setIsPlacing] = useState(false);

    useEffect(() => {
        const unsub = subscribeToMenu();
        return unsub;
    }, []);

    const availableItems = useMemo(() => {
        return menuItems.filter(item => {
            if (!item.available) return false;
            if (search.trim()) {
                return item.name.toLowerCase().includes(search.toLowerCase());
            }
            return true;
        });
    }, [menuItems, search]);

    const addItem = (item: MenuItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.menuItem.itemId === item.itemId);
            if (existing) {
                return prev.map(i => i.menuItem.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItem: item, quantity: 1 }];
        });
    };

    const removeItem = (itemId: string) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.menuItem.itemId === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.menuItem.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.menuItem.itemId !== itemId);
        });
    };

    const getQuantity = (itemId: string) => {
        return selectedItems.find(i => i.menuItem.itemId === itemId)?.quantity || 0;
    };

    const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = selectedItems.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0);

    const handlePlaceOrder = async () => {
        if (selectedItems.length === 0) return;
        setIsPlacing(true);
        try {
            await placeOrder({
                userId: null as any,
                customerName: customerName.trim() || 'Walk-in Customer',
                items: selectedItems,
                totalAmount,
                pickupTime: Date.now() + 20 * 60000,
                estimatedPickupTime: Date.now() + 20 * 60000,
                paymentStatus: 'Unpaid',
                paymentMethod: 'Cash'
            });
            Alert.alert('Success', 'Walk-in order placed!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch {
            Alert.alert('Error', 'Failed to place order');
        } finally {
            setIsPlacing(false);
        }
    };

    // Step 1: Select Items
    const renderStep1 = () => (
        <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#757575" />
                <TextInput
                    placeholder="Search menu items..."
                    placeholderTextColor="#757575"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />
            </View>

            <FlatList
                data={availableItems}
                keyExtractor={item => item.itemId}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => {
                    const qty = getQuantity(item.itemId);
                    return (
                        <View style={styles.menuCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                {item.isCombo && item.comboItems && (
                                    <Text style={styles.comboText} numberOfLines={1}>
                                        {item.comboItems.join(' • ')}
                                    </Text>
                                )}
                                <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
                            </View>
                            {qty === 0 ? (
                                <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                    <Text style={styles.addBtnText}>Add</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.stepper}>
                                    <TouchableOpacity onPress={() => removeItem(item.itemId)} style={styles.stepBtn}>
                                        <Ionicons name="remove" size={16} color="#FF6A00" />
                                    </TouchableOpacity>
                                    <Text style={styles.stepCount}>{qty}</Text>
                                    <TouchableOpacity onPress={() => addItem(item)} style={styles.stepBtn}>
                                        <Ionicons name="add" size={16} color="#FF6A00" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </Animated.View>
    );

    // Step 2: Review & Place
    const renderStep2 = () => (
        <Animated.ScrollView entering={FadeInDown.duration(400)} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            {/* Customer Name */}
            <Text style={styles.sectionLabel}>Customer Name (Optional)</Text>
            <View style={styles.nameInput}>
                <Ionicons name="person-outline" size={18} color="#757575" />
                <TextInput
                    placeholder="Walk-in Customer"
                    placeholderTextColor="#757575"
                    value={customerName}
                    onChangeText={setCustomerName}
                    style={styles.nameTextField}
                />
            </View>

            {/* Order Items */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Order Items</Text>
            {selectedItems.map(item => (
                <View key={item.menuItem.itemId} style={styles.reviewCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{item.menuItem.name}</Text>
                        <Text style={styles.reviewPrice}>{formatCurrency(item.menuItem.price)} × {item.quantity}</Text>
                    </View>
                    <Text style={styles.reviewTotal}>{formatCurrency(item.menuItem.price * item.quantity)}</Text>
                </View>
            ))}

            {/* Summary */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items</Text>
                    <Text style={styles.summaryValue}>{totalItems}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
            </View>
        </Animated.ScrollView>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Walk-in Order</Text>
                    <Text style={styles.stepText}>Step {step} of 2 · {step === 1 ? 'Select Items' : 'Review & Place'}</Text>
                </View>
            </View>

            {step === 1 ? renderStep1() : renderStep2()}

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
                {step === 1 ? (
                    <TouchableOpacity
                        onPress={() => setStep(2)}
                        disabled={selectedItems.length === 0}
                        style={[styles.nextBtn, selectedItems.length === 0 && { opacity: 0.5 }]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextGradient}
                        >
                            <Text style={styles.nextText}>Review ({totalItems} items · {formatCurrency(totalAmount)})</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePlaceOrder}
                            disabled={isPlacing}
                            style={[styles.placeBtn, isPlacing && { opacity: 0.5 }]}
                        >
                            <LinearGradient
                                colors={['#FF6A00', '#E53B0A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.placeGradient}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.placeText}>{isPlacing ? 'Placing...' : 'Place Order'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14,
    },
    title: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Poppins_700Bold' },
    stepText: { color: '#FF6A00', fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#252121',
        marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
    menuCard: {
        backgroundColor: '#252121', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#353030',
    },
    cardName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
    comboText: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    cardPrice: { color: '#FF6A00', fontSize: 15, fontFamily: 'Inter_700Bold' },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FF6A00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    addBtnText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_700Bold' },
    stepper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1818',
        borderRadius: 12, paddingHorizontal: 4, paddingVertical: 4, borderWidth: 1, borderColor: '#353030',
    },
    stepBtn: { padding: 6, paddingHorizontal: 8 },
    stepCount: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold', paddingHorizontal: 8 },
    sectionLabel: {
        color: '#757575', fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
        marginBottom: 10, textTransform: 'uppercase',
    },
    nameInput: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#252121',
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 10,
        borderWidth: 1, borderColor: '#353030',
    },
    nameTextField: { flex: 1, color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
    reviewCard: {
        backgroundColor: '#252121', borderRadius: 14, padding: 16,
        flexDirection: 'row', alignItems: 'center', marginBottom: 8,
        borderWidth: 1, borderColor: '#353030',
    },
    reviewName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    reviewPrice: { color: '#757575', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
    reviewTotal: { color: '#FF6A00', fontSize: 17, fontFamily: 'Inter_700Bold' },
    summaryCard: {
        backgroundColor: '#252121', borderRadius: 18, padding: 20, marginTop: 16,
        borderWidth: 1, borderColor: '#353030',
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_400Regular' },
    summaryValue: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    summaryTotal: {
        borderTopWidth: 1, borderTopColor: '#353030', paddingTop: 14, marginTop: 4, marginBottom: 0,
    },
    totalLabel: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
    totalValue: { color: '#FF6A00', fontSize: 22, fontFamily: 'Inter_700Bold' },
    bottomBar: {
        backgroundColor: '#252121', paddingHorizontal: 16, paddingTop: 14,
        borderTopWidth: 1, borderTopColor: '#353030',
    },
    nextBtn: { borderRadius: 14, overflow: 'hidden' },
    nextGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 16, borderRadius: 14,
    },
    nextText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#353030', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14,
    },
    backText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    placeBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
    placeGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 16, borderRadius: 14,
    },
    placeText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
