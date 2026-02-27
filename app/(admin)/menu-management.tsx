import { View, Text, FlatList, TouchableOpacity, ScrollView, Switch, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';

import { MenuItem } from '../../types/models';
import { useMenuStore } from '../../store/menuStore';
import firestore from '@react-native-firebase/firestore';

const formatCurrency = (amount: number) => `₹${amount}`;

const CATEGORIES = ['All', 'BBQ', 'Wings', 'Combo', 'Starters', 'Mains', 'Sides', 'Drinks'];

export default function MenuManagementScreen() {
    const router = useRouter();
    const { menuItems, subscribeToMenu, updateMenuItem } = useMenuStore();
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
                        await firestore().collection('menuItems').doc(itemId).delete();
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
                        const batch = firestore().batch();
                        const snapshot = await firestore().collection('menuItems').get();
                        snapshot.docs.forEach(doc => batch.delete(doc.ref));

                        const actualMenu = [
                            { name: 'Grilled Leg Piece – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled leg piece' },
                            { name: 'Grilled Thigh – 1 Pc', price: 140, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Single grilled thigh piece' },
                            { name: 'Grilled Drumstick – 2 Pcs', price: 120, preparationTime: 20, category: 'BBQ', available: true, isCombo: false, description: 'Two grilled drumsticks' },
                            { name: 'Chicken Lollipop – 5 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Five pieces of chicken lollipop' },
                            { name: 'BBQ Wings – 6 Pcs', price: 120, preparationTime: 20, category: 'Wings', available: true, isCombo: false, description: 'Six pieces of BBQ wings' },
                            { name: 'Wings & Lollipop Combo', price: 219, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['Wings (6 Pcs)', 'Lollipop (5 Pcs)'], description: 'Best entry combo' },
                            { name: 'Grill Duo Combo', price: 259, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', '1 Thigh'], description: 'Classic 2-piece grill' },
                            { name: 'Grill Mix Combo', price: 339, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', 'Drumstick (2 Pcs)', 'Wings (6 Pcs)'], description: 'Mixed grill platter' },
                            { name: 'Mini Party Combo', price: 359, preparationTime: 20, category: 'Combo', available: true, isCombo: true, comboItems: ['1 Leg', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)'], description: 'Perfect for small gatherings' },
                            { name: 'Family Combo', price: 579, preparationTime: 25, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)', 'Drumstick (2 Pcs)'], description: 'Large combo for the whole family' },
                            { name: 'NightFlame Mega Grill', price: 799, preparationTime: 30, category: 'Combo', available: true, isCombo: true, comboItems: ['2 Legs', '2 Thighs', 'Wings (6 Pcs)', 'Lollipop (5 Pcs)', 'Drumstick (2 Pcs)'], description: 'The ultimate Mega Grill' },
                        ];

                        actualMenu.forEach(item => {
                            const newRef = firestore().collection('menuItems').doc();
                            batch.set(newRef, item);
                        });

                        await batch.commit();
                        Alert.alert('Success', 'Menu seeded successfully!');
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }
            }
        ]);
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
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
        </View>
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

            {/* Item count */}
            <Text style={styles.itemCount}>{filteredItems.length} items</Text>

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
                        <Ionicons name="refresh-outline" size={16} color="#FF6A00" />
                        <Text style={styles.seedText}>Seed Default Menu</Text>
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
        backgroundColor: 'rgba(255, 106, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 106, 0, 0.3)',
    },
    seedText: { color: '#FF6A00', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
