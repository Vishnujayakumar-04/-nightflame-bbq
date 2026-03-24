import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuItem, AddOn, SelectedAddOn } from '../types/models';

interface ItemCustomizationModalProps {
    visible: boolean;
    menuItem: MenuItem | null;
    onClose: () => void;
    onAddToCart: (item: MenuItem, addOns: SelectedAddOn[]) => void;
}

export function ItemCustomizationModal({ visible, menuItem, onClose, onAddToCart }: ItemCustomizationModalProps) {
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

    useEffect(() => {
        // Reset state when a new item is opened
        if (visible && menuItem) {
            setSelectedAddOns([]);
        }
    }, [visible, menuItem]);

    if (!menuItem) return null;

    const handleAddOnQuantityChange = (addon: AddOn, delta: number) => {
        setSelectedAddOns(prev => {
            const existing = prev.find(a => a.name === addon.name);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = Math.max(0, currentQty + delta); // don't go below 0

            // If maxQuantity is defined, respect it
            if (addon.maxQuantity && newQty > addon.maxQuantity) return prev;

            if (newQty === 0) {
                return prev.filter(a => a.name !== addon.name);
            }

            if (existing) {
                return prev.map(a => a.name === addon.name ? { ...a, quantity: newQty } : a);
            }

            return [...prev, { name: addon.name, price: addon.price, quantity: newQty }];
        });
    };

    const getAddOnQuantity = (addonName: string) => {
        const item = selectedAddOns.find(a => a.name === addonName);
        return item ? item.quantity : 0;
    };

    // Calculate total price for 1 base item + its addons
    const basePrice = menuItem.price;
    const addOnTotal = selectedAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    const totalPrice = basePrice + addOnTotal;

    const handleAdd = () => {
        onAddToCart(menuItem, selectedAddOns);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Customize Item</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Base Item Info */}
                        <View style={styles.itemCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{menuItem.name}</Text>
                                <Text style={styles.itemBasePrice}>₹{menuItem.price}</Text>
                            </View>
                            <View style={styles.quantityBadge}>
                                <Text style={styles.quantityText}>1x</Text>
                            </View>
                        </View>

                        {/* Add-ons List */}
                        {menuItem.addOns && menuItem.addOns.length > 0 && (
                            <View style={styles.addOnSection}>
                                <Text style={styles.sectionTitle}>Add-ons & Extras</Text>
                                {menuItem.addOns.map((addon) => {
                                    const qty = getAddOnQuantity(addon.name);
                                    return (
                                        <View key={addon.name} style={styles.addOnRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.addOnName}>{addon.name}</Text>
                                                <Text style={styles.addOnPrice}>+ ₹{addon.price} per piece</Text>
                                            </View>
                                            
                                            <View style={styles.stepper}>
                                                <TouchableOpacity 
                                                    style={[styles.stepBtn, qty === 0 && { opacity: 0.5 }]} 
                                                    onPress={() => handleAddOnQuantityChange(addon, -1)}
                                                    disabled={qty === 0}
                                                >
                                                    <Ionicons name="remove" size={18} color="#FF6A00" />
                                                </TouchableOpacity>
                                                <Text style={styles.stepValue}>{qty}</Text>
                                                <TouchableOpacity 
                                                    style={styles.stepBtn}
                                                    onPress={() => handleAddOnQuantityChange(addon, 1)}
                                                >
                                                    <Ionicons name="add" size={18} color="#FF6A00" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer Action */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
                            <LinearGradient colors={['#FF6A00', '#E53B0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addGradient}>
                                <Text style={styles.addBtnText}>Add 1 Item</Text>
                                <View style={styles.divider} />
                                <Text style={styles.addBtnTotal}>₹{totalPrice}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1A1818',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#353030',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Poppins_700Bold' },
    itemCard: {
        backgroundColor: '#252121',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#353030',
        marginBottom: 24,
    },
    itemName: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
    itemBasePrice: { color: '#FF6A00', fontSize: 15, fontFamily: 'Inter_700Bold' },
    quantityBadge: { backgroundColor: '#353030', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    quantityText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
    addOnSection: { marginBottom: 16 },
    sectionTitle: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    addOnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#252121',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#353030',
    },
    addOnName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
    addOnPrice: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular' },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1818',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#353030',
        padding: 4,
    },
    stepBtn: { padding: 8 },
    stepValue: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', paddingHorizontal: 12, minWidth: 32, textAlign: 'center' },
    footer: { marginTop: 8 },
    addBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    addGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    addBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'center' },
    divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
    addBtnTotal: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_700Bold', flex: 1, textAlign: 'center' },
});
