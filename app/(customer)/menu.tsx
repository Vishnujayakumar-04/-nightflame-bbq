import { View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react';

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { MenuItem } from '../../types/models';

const formatCurrency = (amount: number) => `₹${amount}`;

export default function MenuScreen() {
    const { menuItems, isLoading, subscribeToMenu } = useMenuStore();
    const { addItem } = useCartStore();
    const [search, setSearch] = useState('');
    const [vegOnly, setVegOnly] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const unsubscribe = subscribeToMenu();
        return unsubscribe;
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(menuItems.map(item => item.category));
        return ['All', ...Array.from(cats)];
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        let result = menuItems;

        if (search.trim()) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        return result;
    }, [menuItems, search, vegOnly, selectedCategory]);

    const getCategoryEmoji = (cat: string) => {
        const map: Record<string, string> = {
            'All': '🔥',
            'BBQ': '🍗',
            'Wings': '🍗',
            'Combo': '🍱',
            'Starters': '🍟',
            'Mains': '🥩',
            'Sides': '🥗',
            'Drinks': '🥤',
        };
        return map[cat] || '🍽️';
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.menuImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.menuImage, styles.placeholderImage]}>
                    <Ionicons name="restaurant" size={28} color="#555" />
                </View>
            )}
            <View style={styles.menuInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={[styles.vegIndicator, { backgroundColor: item.category === 'Combo' ? '#FF6A00' : '#4CAF50' }]} />
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
                {item.isCombo && item.comboItems && (
                    <Text style={styles.comboItems} numberOfLines={1}>
                        {item.comboItems.join(' • ')}
                    </Text>
                )}
                <View style={styles.menuBottom}>
                    <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
                    {item.available ? (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addItem(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                            <Text style={styles.addText}>Add</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.soldOutBadge}>
                            <Text style={styles.soldOutText}>Sold Out</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Our Menu 🍖</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#757575" />
                <TextInput
                    placeholder="Search dishes..."
                    placeholderTextColor="#757575"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />
            </View>

            {/* Veg Only Toggle */}
            <TouchableOpacity
                style={[styles.vegToggle, vegOnly && styles.vegToggleActive]}
                onPress={() => setVegOnly(!vegOnly)}
            >
                <View style={[styles.vegBox, vegOnly && styles.vegBoxActive]}>
                    {vegOnly && <View style={styles.vegDotSmall} />}
                </View>
                <Text style={[styles.vegText, vegOnly && { color: '#4CAF50' }]}>Veg Only</Text>
            </TouchableOpacity>

            {/* Category Chips */}
            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item: cat }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat)}</Text>
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === cat && styles.categoryTextActive,
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Menu List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6A00" />
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.itemId}
                    renderItem={renderMenuItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={48} color="#555" />
                            <Text style={styles.emptyText}>No items found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1818',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontFamily: 'Poppins_700Bold',
        fontStyle: 'italic',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252121',
        marginHorizontal: 20,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 14,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        padding: 0,
    },
    vegToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginBottom: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#252121',
        gap: 8,
    },
    vegToggleActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    vegBox: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegBoxActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    vegDotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    vegText: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 10,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#252121',
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: '#FF6A00',
    },
    categoryEmoji: {
        fontSize: 14,
    },
    categoryText: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    menuCard: {
        backgroundColor: '#252121',
        borderRadius: 18,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#353030',
    },
    menuImage: {
        width: 110,
        height: 130,
    },
    placeholderImage: {
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuInfo: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    vegIndicator: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    menuName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        flex: 1,
    },
    menuDescription: {
        color: '#757575',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        lineHeight: 17,
        marginBottom: 4,
    },
    comboItems: {
        color: '#FF6A00',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
    },
    menuBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    menuPrice: {
        color: '#FF6A00',
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6A00',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    addText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Inter_700Bold',
    },
    soldOutBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 83, 80, 0.15)',
    },
    soldOutText: {
        color: '#EF5350',
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        color: '#757575',
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
});
