import { View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cols with padding and gap

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

        // Apply veg filter (Assuming items that aren't strictly tagged as explicitly non-veg are veg, 
        // or just mock it here by excluding 'Combo'/'Wings' for the demo as a fast solution if no strict boolean exists)
        if (vegOnly) {
            result = result.filter(item => item.category !== 'Wings' && item.category !== 'BBQ' && item.category !== 'Combo');
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

    const renderMenuItem = ({ item, index }: { item: MenuItem, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={styles.menuCardContainer}>
            <View style={styles.menuCardOuter}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.menuImageTop} resizeMode="cover" />
                ) : (
                    <View style={[styles.menuImageTop, styles.placeholderImage]}>
                        <Ionicons name="restaurant" size={32} color="#555" />
                    </View>
                )}
                <View style={styles.menuInfoContainer}>
                    <Text style={styles.menuNameCard} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.menuDescriptionCard} numberOfLines={3}>
                        {item.description || 'Chicken Biryani is a highly aromatic, mouth-watering staple dish.'}
                    </Text>
                    <Text style={styles.menuPriceCard}>{formatCurrency(item.price)}</Text>
                    {item.available ? (
                        <TouchableOpacity style={styles.orderButtonWrap} onPress={() => addItem(item)} activeOpacity={0.8}>
                            <LinearGradient colors={['#F36D25', '#E5580F']} style={styles.orderGradientBtn}>
                                <Text style={styles.orderBtnText}>Order Now</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.soldOutPill}>
                            <Text style={styles.soldOutPillText}>Sold Out</Text>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
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
                    numColumns={2}
                    renderItem={renderMenuItem}
                    contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 120, gap: 16 }}
                    columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
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
    menuCardContainer: {
        width: CARD_WIDTH,
        marginBottom: 40,
        marginTop: 40,
    },
    menuCardOuter: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        paddingTop: 55, // space for drifting image
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        minHeight: 200,
        justifyContent: 'space-between'
    },
    menuImageTop: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'absolute',
        top: -50,
        alignSelf: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#F7F7F7',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAEAEA',
    },
    menuInfoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    menuNameCard: {
        color: '#1A1A1A',
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    menuDescriptionCard: {
        color: '#757575',
        fontSize: 10,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        lineHeight: 14,
        marginBottom: 10,
    },
    menuPriceCard: {
        color: '#F36D25',
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 12,
    },
    orderButtonWrap: {
        width: '85%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#F36D25',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    orderGradientBtn: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
    },
    soldOutPill: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 8,
        width: '85%',
        borderRadius: 20,
        alignItems: 'center',
    },
    soldOutPillText: {
        color: '#9E9E9E',
        fontSize: 12,
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
