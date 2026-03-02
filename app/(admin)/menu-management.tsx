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
                            { name: 'NightFlame Mega Grill', price: 799, preparationTime: 30, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs (280)', '2 Thighs (280)', 'Wings (120)', 'Lollipop (120)', 'Drumstick (120)'], description: 'The absolute feast' },
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
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={styles.menuCard}>
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
                <Text style={styles.menuCategory}>{item.category}</Text>
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

            {/* Item count or Empty State Banner */}
            {menuItems.length === 0 && !isLoading ? (
                <Animated.View entering={FadeInDown.duration(600)} style={styles.setupBanner}>
                    <View style={styles.setupIcon}>
                        <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.setupTitle}>Setup Your Shop</Text>
                        <Text style={styles.setupSubtitle}>Quickly add your official NightFlame items, prices, and combos.</Text>
                    </View>
                    <TouchableOpacity style={styles.setupActionBtn} onPress={handleSeedMenu}>
                        <Text style={styles.setupActionText}>Start</Text>
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Text style={styles.itemCount}>{filteredItems.length} items</Text>
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
    title: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    addItemBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FF6A00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    },
    addItemText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
    categoryList: { paddingHorizontal: 16, gap: 8, marginBottom: 10 },
    categoryChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#252121', borderWidth: 1, borderColor: '#353030',
    },
    categoryChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
    categoryText: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    categoryTextActive: { color: '#FFFFFF' },
    itemCount: {
        color: '#757575', fontSize: 13, fontFamily: 'Inter_400Regular',
        paddingHorizontal: 20, marginBottom: 12,
    },
    menuCard: {
        backgroundColor: '#252121', borderRadius: 16, flexDirection: 'row', alignItems: 'center',
        padding: 12, borderWidth: 1, borderColor: '#353030',
    },
    menuImage: { width: 64, height: 64, borderRadius: 12 },
    placeholderImage: { backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
    menuInfo: { flex: 1, marginLeft: 14 },
    menuName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
    menuPrice: { color: '#FF6A00', fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 2 },
    menuCategory: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular' },
    menuActions: { flexDirection: 'column', alignItems: 'center', gap: 6 },
    editBtn: { padding: 4 },
    deleteBtn: { padding: 4 },
    seedButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 20, padding: 14, borderRadius: 14,
        backgroundColor: 'rgba(255, 106, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(53, 48, 48, 0.5)',
    },
    seedText: { color: '#757575', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    setupBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6A00',
        marginHorizontal: 20, padding: 20, borderRadius: 20, gap: 16, marginBottom: 20,
        elevation: 10, shadowColor: '#FF6A00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
    },
    setupIcon: {
        width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    setupTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
    setupSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 18 },
    setupActionBtn: {
        backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
    },
    setupActionText: { color: '#FF6A00', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
