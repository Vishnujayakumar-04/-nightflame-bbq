import { View, Text, FlatList, TouchableOpacity, ScrollView, Switch, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MenuItem } from '../../types/models';
import { useMenuStore } from '../../store/menuStore';
import { db } from '../../firebaseConfig';
import { collection, doc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

const formatCurrency = (amount: number) => `₹${amount}`;


const CATEGORIES = ['All', 'BBQ', 'Wings', 'Combo'];

export default function MenuManagementScreen() {
    const router = useRouter();
    const { menuItems, subscribeToMenu, updateMenuItem, isLoading } = useMenuStore();
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const unsub = subscribeToMenu();
        return unsub;
    }, []);

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'All') return menuItems;
        return menuItems.filter(item => item.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    const toggleAvailability = (itemId: string, current: boolean) => {
        updateMenuItem(itemId, { available: !current });
    };

    const handleDeleteItem = (itemId: string, name: string) => {
        Alert.alert('Delete Item', `Remove "${name}" from the menu?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'menuItems', itemId));
                    } catch {
                        Alert.alert('Error', 'Failed to delete item');
                    }
                }
            }
        ]);
    };

    const handleRemoveDuplicates = async () => {
        Alert.alert('Remove Duplicates', 'Are you sure you want to remove duplicate menu items based on name?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: async () => {
                    try {
                        const batch = writeBatch(db);
                        const seen = new Set();
                        let count = 0;
                        menuItems.forEach(item => {
                            if (seen.has(item.name)) {
                                batch.delete(doc(db, 'menuItems', item.itemId));
                                count++;
                            } else {
                                seen.add(item.name);
                            }
                        });

                        if (count > 0) {
                            await batch.commit();
                            Alert.alert('Success', `Removed ${count} duplicate items`);
                        } else {
                            Alert.alert('Info', 'No duplicate items found');
                        }
                    } catch (e: any) {
                        Alert.alert('Error', `Failed to remove duplicates: ${e.message}`);
                    }
                }
            }
        ]);
    };

    const handleSeedMenu = async () => {
        Alert.alert('Seed Menu', 'This will wipe all existing menu items and replace them with the default list. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Proceed', style: 'destructive',
                onPress: async () => {
                    try {
                        const batch = writeBatch(db);
                        const snapshot = await getDocs(collection(db, 'menuItems'));
                        snapshot.docs.forEach(d => batch.delete(d.ref));

                        const actualMenu = [
                            { name: 'Grilled Leg Piece – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled leg piece' },
                            { name: 'Grilled Thigh – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled thigh piece' },
                            { name: 'Grilled Drumstick – 2 Pcs', price: 120, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Two grilled drumstick pieces' },
                            { name: 'Chicken Lollipop – 5 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Five crunchy chicken lollipops' },
                            { name: 'BBQ Wings – 6 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Six smoky BBQ wings' },
                            { name: 'Wings & Lollipop Combo', price: 219, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['Wings (6 Pcs)', 'Lollipop (5 Pcs)'], description: 'Best entry combo' },
                            { name: 'Grill Duo Combo', price: 259, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg (140)', '1 Thigh (140)'], description: 'Classic 2-piece grill' },
                            { name: 'Grill Mix Combo', price: 339, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg (140)', 'Drumstick 2pcs (120)', 'Wings (120)'], description: 'Variety mix' },
                            { name: 'Mini Party Combo', price: 359, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['Leg (140)', 'Wings (120)', 'Lollipop (120)'], description: 'For small gatherings' },
                            { name: 'Family Combo', price: 579, preparationTime: 25, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs (280)', 'Wings (120)', 'Lollipop (120)', 'Drumstick (120)'], description: 'Mega family pack' },
                            { name: 'Barquee Mega Grill', price: 799, preparationTime: 30, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs (280)', '2 Thighs (280)', 'Wings (120)', 'Lollipop (120)', 'Drumstick (120)'], description: 'The absolute feast' },
                        ];

                        actualMenu.forEach(item => {
                            const newRef = doc(collection(db, 'menuItems'));
                            batch.set(newRef, { ...item, createdAt: Date.now() });
                        });

                        await batch.commit();
                        Alert.alert('Success', 'Shop Menu Created Successfully!');
                    } catch (e: any) {
                        Alert.alert('Error', `Failed to seed menu: ${e.message}`);
                    }
                }
            }
        ]);
    };

    const renderMenuItem = ({ item, index }: { item: MenuItem, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={[styles.menuCard, !item.available && { opacity: 0.65 }]}>
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.menuImage} resizeMode="cover" />
            ) : (
                <View style={[styles.menuImage, styles.placeholderImage]}>
                    <Ionicons name="restaurant" size={24} color="#555" />
                </View>
            )}
            <View style={styles.menuInfo}>
                <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={styles.menuCategory}>{item.category}</Text>
                    {!item.available && (
                        <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.menuActions}>
                <Switch
                    value={item.available}
                    onValueChange={() => toggleAvailability(item.itemId, item.available)}
                    trackColor={{ false: '#3A3A3A', true: 'rgba(76, 175, 80, 0.5)' }}
                    thumbColor={item.available ? '#4CAF50' : '#757575'}
                />
                <TouchableOpacity
                    onPress={() => router.push(`/(admin)/menu-form?itemId=${item.itemId}`)}
                    style={styles.editBtn}
                >
                    <Ionicons name="create-outline" size={18} color="#FF6A00" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteItem(item.itemId, item.name)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="trash-outline" size={18} color="#EF5350" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Menu Management</Text>
                <TouchableOpacity
                    style={styles.addItemBtn}
                    onPress={() => router.push('/(admin)/menu-form')}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <View style={{ height: 48, marginBottom: 6 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Item count or Empty State Banner */}
            {menuItems.length === 0 && !isLoading ? (
                <Animated.View entering={FadeInDown.duration(600)} style={styles.setupBanner}>
                    <View style={styles.setupIcon}>
                        <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.setupTitle}>Setup Your Shop</Text>
                        <Text style={styles.setupSubtitle}>Quickly add your official Barquee Grill items, prices, and combos.</Text>
                    </View>
                    <TouchableOpacity style={styles.setupActionBtn} onPress={handleSeedMenu}>
                        <Text style={styles.setupActionText}>Start</Text>
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Text style={styles.itemCount}>{filteredItems.length} items</Text>
            )}

            {/* Remove Duplicates Action */}
            {menuItems.length > 0 && (
                <TouchableOpacity style={styles.deduplicateBtn} onPress={handleRemoveDuplicates}>
                    <Ionicons name="trash-bin-outline" size={14} color="#EF5350" />
                    <Text style={styles.deduplicateText}>Remove Duplicates</Text>
                </TouchableOpacity>
            )}

            {/* Menu Items List */}
            <FlatList
                data={filteredItems}
                keyExtractor={item => item.itemId}
                renderItem={renderMenuItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListFooterComponent={
                    <TouchableOpacity style={styles.seedButton} onPress={handleSeedMenu}>
                        <Ionicons name="sparkles-outline" size={16} color="#FF6A00" />
                        <Text style={styles.seedText}>Setup Official Store Menu</Text>
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14,
    },
    title: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Urbanist_700Bold', fontStyle: 'italic' },
    addItemBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FF6A00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    },
    addItemText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Urbanist_700Bold' },
    categoryList: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    categoryChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, height: 40,
        backgroundColor: '#252121', borderWidth: 1, borderColor: '#353030',
    },
    categoryChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
    categoryText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Urbanist_600SemiBold' },
    categoryTextActive: { color: '#FFFFFF' },
    itemCount: {
        color: '#757575', fontSize: 13, fontFamily: 'Urbanist_400Regular',
        paddingHorizontal: 20, marginBottom: 12,
    },
    menuCard: {
        backgroundColor: '#252121',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    menuImage: {
        width: 64, height: 64, borderRadius: 32,
        borderWidth: 2, borderColor: '#353030'
    },
    placeholderImage: { backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
    menuInfo: { flex: 1, marginLeft: 16 },
    menuName: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Urbanist_700Bold', marginBottom: 2 },
    menuPrice: { color: '#FF6A00', fontSize: 15, fontFamily: 'Urbanist_700Bold', marginBottom: 2 },
    menuCategory: { color: '#A5A2A2', fontSize: 11, fontFamily: 'Urbanist_500Medium' },
    outOfStockBadge: {
        backgroundColor: 'rgba(239, 83, 80, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    outOfStockText: {
        color: '#EF5350',
        fontSize: 10,
        fontFamily: 'Urbanist_600SemiBold',
    },
    menuActions: { flexDirection: 'column', alignItems: 'center', gap: 6 },
    editBtn: { padding: 4 },
    deleteBtn: { padding: 4 },
    seedButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 20, padding: 14, borderRadius: 14,
        backgroundColor: 'rgba(255, 106, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(53, 48, 48, 0.5)',
    },
    seedText: { color: '#757575', fontSize: 13, fontFamily: 'Urbanist_600SemiBold' },
    setupBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6A00',
        marginHorizontal: 20, padding: 20, borderRadius: 20, gap: 16, marginBottom: 20,
        elevation: 10, shadowColor: '#FF6A00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
    },
    setupIcon: {
        width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    setupTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Urbanist_700Bold' },
    setupSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Urbanist_400Regular', marginTop: 2, lineHeight: 18 },
    setupActionBtn: {
        backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    },
    setupActionText: { color: '#F36D25', fontSize: 14, fontFamily: 'Urbanist_800ExtraBold' },
    deduplicateBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        marginHorizontal: 20, marginBottom: 12, paddingVertical: 10, borderRadius: 10,
        backgroundColor: 'rgba(239, 83, 80, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 83, 80, 0.3)',
    },
    deduplicateText: { color: '#EF5350', fontSize: 13, fontFamily: 'Urbanist_600SemiBold' },
});
