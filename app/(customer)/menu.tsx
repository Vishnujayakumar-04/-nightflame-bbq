import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Dimensions, Modal, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cols with padding and gap

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useShopStore } from '../../store/shopStore';
import { MenuItem, AddOn, SelectedAddOn } from '../../types/models';
import { getMenuItemImage } from '../../constants/menuImages';

const formatCurrency = (amount: number) => `₹${amount}`;

// Estimated nutrition based on category
const getNutritionInfo = (item: MenuItem) => {
    const categoryNutrition: Record<string, { protein: string; calories: string; servingSize: string }> = {
        'BBQ': { protein: '22-28g', calories: '250-320 kcal', servingSize: '1 piece' },
        'Wings': { protein: '18-22g', calories: '200-280 kcal', servingSize: 'per serving' },
        'Combo': { protein: '45-65g', calories: '550-750 kcal', servingSize: 'full combo' },
        'Starters': { protein: '12-18g', calories: '180-250 kcal', servingSize: 'per serving' },
        'Mains': { protein: '30-40g', calories: '350-450 kcal', servingSize: 'per plate' },
    };
    return categoryNutrition[item.category] || { protein: '20-30g', calories: '250-350 kcal', servingSize: 'per serving' };
};

export default function MenuScreen() {
    const { menuItems, isLoading, subscribeToMenu } = useMenuStore();
    const addItem = useCartStore(state => state.addItem);
    const getCartTotal = useCartStore(state => state.getCartTotal);
    const getItemCount = useCartStore(state => state.getItemCount);
    const { status: shopStatus, subscribeToStatus } = useShopStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [spiceLevel, setSpiceLevel] = useState('Normal');
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
    const [modalQuantity, setModalQuantity] = useState(1);

    // Reset modal when closing or opening
    useEffect(() => {
        if (!selectedItem) {
            setSpiceLevel('Normal');
            setSelectedAddOns([]);
            setModalQuantity(1);
        }
    }, [selectedItem]);

    const handleAddOnQuantityChange = (addon: AddOn, delta: number) => {
        setSelectedAddOns(prev => {
            const existing = prev.find(a => a.name === addon.name);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = Math.max(0, currentQty + delta); 

            if (addon.maxQuantity && newQty > addon.maxQuantity) return prev;
            if (newQty === 0) return prev.filter(a => a.name !== addon.name);
            if (existing) return prev.map(a => a.name === addon.name ? { ...a, quantity: newQty } : a);
            
            return [...prev, { name: addon.name, price: addon.price, quantity: newQty }];
        });
    };

    const getAddOnQuantity = (addonName: string) => {
        const item = selectedAddOns.find(a => a.name === addonName);
        return item ? item.quantity : 0;
    };

    useEffect(() => {
        const unsubMenu = subscribeToMenu();
        const unsubShop = subscribeToStatus();
        return () => {
            unsubMenu();
            unsubShop();
        };
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
    }, [menuItems, search, selectedCategory]);



    const renderMenuItem = useCallback(({ item }: { item: MenuItem }) => (
        <Animated.View style={styles.menuCardContainer}>
            <TouchableOpacity
                activeOpacity={shopStatus?.isOpen ? 0.85 : 1}
                onPress={() => shopStatus?.isOpen && setSelectedItem(item)}
                style={[
                    styles.menuCardOuter,
                    !item.available && { opacity: 0.55 },
                    !shopStatus?.isOpen && { opacity: 0.85 }
                ]}
                disabled={!shopStatus?.isOpen && !item.available} // Allow viewing if only shop is closed? Actually user said "it should not be selected"
            >
                {(() => {
                    const localImg = getMenuItemImage(item.name);
                    if (item.imageUrl) {
                        return <Image source={{ uri: item.imageUrl }} placeholder={require('../../assets/logo_brand.png')} style={styles.menuImageTop} contentFit="cover" transition={300} cachePolicy="memory-disk" />;
                    } else if (localImg) {
                        return <Image source={localImg} style={styles.menuImageTop} contentFit="cover" />;
                    } else {
                        return (
                            <View style={[styles.menuImageTop, styles.placeholderImage]}>
                                <Ionicons name="restaurant" size={32} color="#555" />
                            </View>
                        );
                    }
                })()}
                <View style={styles.menuInfoContainer}>
                    <Text style={styles.menuNameCard} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.menuDescriptionCard} numberOfLines={2}>
                        {item.description || 'Smoky, juicy & packed with flavor.'}
                    </Text>
                    <Text style={styles.menuPriceCard}>{formatCurrency(item.price)}</Text>
                    {item.available ? (
                        <TouchableOpacity
                            style={styles.orderButtonWrap}
                            onPress={(e) => {
                                e.stopPropagation();
                                if (!shopStatus?.isOpen) return;
                                setSelectedItem(item);
                            }}
                            activeOpacity={shopStatus?.isOpen ? 0.8 : 1}
                            disabled={!shopStatus?.isOpen}
                        >
                            <LinearGradient
                                colors={shopStatus?.isOpen ? ['#F36D25', '#E5580F'] : ['#4A4A4A', '#3A3A3A']}
                                style={styles.orderGradientBtn}
                            >
                                <Text style={styles.orderBtnText}>
                                    {shopStatus?.isOpen ? 'Add' : 'Closed'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.soldOutPill}>
                            <Text style={styles.soldOutPillText}>Sold Out</Text>
                        </View>
                    )}
                    {!shopStatus?.isOpen && (
                        <View style={styles.cardClosedBadge}>
                            <Text style={styles.cardClosedBadgeText}>CLOSED</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    ), [shopStatus?.isOpen]);

    const nutrition = selectedItem ? getNutritionInfo(selectedItem) : null;

    return (
        <LinearGradient colors={['#1A1818', '#1D1510']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                {!selectedItem && (
                    <View style={[styles.header, { opacity: selectedItem ? 0 : 1 }]}>
                        <Text style={styles.title}>Our Menu</Text>
                    </View>
                )}

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

                {/* Category Chips */}
                <View style={styles.categoryWrapper}>
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
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === cat && styles.categoryTextActive,
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

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
                        contentContainerStyle={{ padding: 16, paddingTop: 30, paddingBottom: 80, gap: 16 }}
                        columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={8}
                        maxToRenderPerBatch={6}
                        windowSize={5}
                        removeClippedSubviews={true}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="restaurant-outline" size={48} color="#555" />
                                <Text style={styles.emptyText}>No items found</Text>
                            </View>
                        }
                    />
                )}

                {/* Floating Cart Button */}
                {getItemCount() > 0 && (
                    <Animated.View entering={FadeInUp.duration(400)} style={styles.floatingCartContainer}>
                        <TouchableOpacity
                            style={styles.floatingCartBtn}
                            onPress={() => router.push('/(customer)/cart')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#FF6A00', '#FF2E00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.floatingCartGradient}
                            >
                                <View style={styles.cartIconBadge}>
                                    <Ionicons name="cart" size={20} color="#FFFFFF" />
                                </View>
                                <Text style={styles.floatingCartText}>
                                    {getItemCount()} • {formatCurrency(getCartTotal())}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Item Detail Modal */}
                <Modal visible={!!selectedItem} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
                    <View style={styles.modalOverlay}>
                        <Pressable style={styles.modalContentPremium} onPress={(e) => e.stopPropagation()}>

                            {selectedItem && (
                                <>
                                    {/* Floating Close Button */}
                                    <TouchableOpacity
                                        style={styles.floatingCloseBtn}
                                        onPress={() => setSelectedItem(null)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="close" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>

                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingBottom: 100 }}
                                        bounces={true}
                                        overScrollMode="always">

                                        {/* Item Image */}
                                        <View style={styles.detailImageContainer}>
                                            {(() => {
                                                const localImg = getMenuItemImage(selectedItem.name);
                                                if (selectedItem.imageUrl) {
                                                    return <Image source={{ uri: selectedItem.imageUrl }} placeholder={require('../../assets/logo_brand.png')} style={styles.detailImagePremium} contentFit="cover" transition={300} cachePolicy="memory-disk" />;
                                                } else if (localImg) {
                                                    return <Image source={localImg} style={styles.detailImagePremium} contentFit="cover" />;
                                                } else {
                                                    return (
                                                        <View style={[styles.detailImagePremium, styles.detailPlaceholderImage]}>
                                                            <Ionicons name="restaurant" size={48} color="#555" />
                                                        </View>
                                                    );
                                                }
                                            })()}
                                        </View>

                                        <View style={styles.detailInfoContent}>
                                            <View style={styles.detailHeaderRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.detailNamePremium}>{selectedItem.name}</Text>
                                                    <Text style={styles.categoryBadgeText}>{selectedItem.category}</Text>
                                                </View>
                                                <View style={styles.priceContainer}>
                                                    <Text style={styles.detailPricePremium}>{formatCurrency(selectedItem.price)}</Text>
                                                </View>
                                            </View>


                                            {/* Description */}
                                            <Text style={styles.detailDescriptionPremium}>
                                                {selectedItem.isCombo && selectedItem.comboItems
                                                    ? `Combo includes: ${selectedItem.comboItems.join(' + ')}`
                                                    : selectedItem.description || 'Smoky, juicy & packed with flavor. Made fresh and grilled to perfection.'}
                                            </Text>

                                            {/* Info Chips */}
                                            <View style={styles.detailChipsRowPremium}>
                                                <View style={styles.detailChipPremium}>
                                                    <Ionicons name="time" size={16} color="#FF6A00" />
                                                    <Text style={styles.detailChipValuePremium}>
                                                        {selectedItem.preparationTime ? `${selectedItem.preparationTime} min` : '20 min'}
                                                    </Text>
                                                </View>
                                                <View style={styles.detailChipPremium}>
                                                    <Ionicons name="flame" size={16} color="#FF6A00" />
                                                    <Text style={styles.detailChipValuePremium}>{nutrition?.calories.split(' ')[0]} Cal</Text>
                                                </View>
                                                <View style={styles.detailChipPremium}>
                                                    <Ionicons name="fitness" size={16} color="#FF6A00" />
                                                    <Text style={styles.detailChipValuePremium}>{nutrition?.protein}</Text>
                                                </View>
                                            </View>

                                            {/* Spice Level */}
                                            <View style={styles.customizationSection}>
                                                <Text style={styles.customizationLabel}>SPICE LEVEL</Text>
                                                <View style={styles.choicesRow}>
                                                    {['Normal', 'Medium', 'Extra Spicy'].map((level) => (
                                                        <TouchableOpacity
                                                            key={level}
                                                            onPress={() => setSpiceLevel(level)}
                                                            style={[
                                                                styles.choiceChip,
                                                                spiceLevel === level && styles.choiceChipActive
                                                            ]}
                                                        >
                                                            <Text style={[
                                                                styles.choiceText,
                                                                spiceLevel === level && styles.choiceTextActive
                                                            ]}>{level}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Dynamic Add-ons */}
                                            {selectedItem.addOns && selectedItem.addOns.length > 0 && (
                                                <View style={[styles.customizationSection, { marginTop: 20 }]}>
                                                    <Text style={styles.customizationLabel}>EXTRA PIECES / ADD-ONS</Text>
                                                    {selectedItem.addOns.map((addon) => {
                                                        const qty = getAddOnQuantity(addon.name);
                                                        return (
                                                            <View key={addon.name} style={[styles.choicesRow, { justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1818', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#353030', marginBottom: 10 }]}>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ color: '#FFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>{addon.name}</Text>
                                                                    <Text style={{ color: '#FF6A00', fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>+₹{addon.price} per piece</Text>
                                                                </View>
                                                                
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252121', borderRadius: 8 }}>
                                                                    <TouchableOpacity 
                                                                        onPress={() => handleAddOnQuantityChange(addon, -1)}
                                                                        style={{ padding: 10, opacity: qty === 0 ? 0.3 : 1 }}
                                                                        disabled={qty === 0}
                                                                    >
                                                                        <Ionicons name="remove" size={18} color="#FFF" />
                                                                    </TouchableOpacity>
                                                                    <Text style={{ color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold', width: 24, textAlign: 'center' }}>{qty}</Text>
                                                                    <TouchableOpacity 
                                                                        onPress={() => handleAddOnQuantityChange(addon, 1)}
                                                                        style={{ padding: 10 }}
                                                                    >
                                                                        <Ionicons name="add" size={18} color="#FF6A00" />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            )}
                                        </View>
                                    </ScrollView>

                                    {/* Fixed Footer Action Bar */}
                                    <View style={[styles.modalFooter, { paddingBottom: Math.max(34, insets.bottom + 16) }]}>
                                        <View style={styles.qtyContainer}>
                                            <TouchableOpacity
                                                onPress={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                                style={styles.qtyBtn}
                                            >
                                                <Ionicons name="remove" size={20} color="#FF6A00" />
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{modalQuantity}</Text>
                                            <TouchableOpacity
                                                onPress={() => setModalQuantity(modalQuantity + 1)}
                                                style={styles.qtyBtn}
                                            >
                                                <Ionicons name="add" size={20} color="#FF6A00" />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.premiumAddBtn, !shopStatus?.isOpen && { opacity: 0.7 }]}
                                            onPress={() => {
                                                if (!shopStatus?.isOpen) return;
                                                
                                                // Calculate dynamic addon cost
                                                const addOnTotal = selectedAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0);
                                                
                                                // Build instructions to include Spice Level and formatted addons
                                                const instructionsArr = [`Spice: ${spiceLevel}`];
                                                if (selectedAddOns.length > 0) {
                                                    instructionsArr.push(selectedAddOns.map(a => `${a.quantity}x ${a.name}`).join(', '));
                                                }
                                                const finalInstructions = instructionsArr.join(' | ');

                                                // Pass selectedAddOns to cart store
                                                for (let i = 0; i < modalQuantity; i++) {
                                                    addItem(selectedItem, finalInstructions, selectedAddOns.length > 0 ? selectedAddOns : undefined);
                                                }
                                                
                                                setSelectedItem(null);
                                            }}
                                            disabled={!shopStatus?.isOpen}
                                        >
                                            <LinearGradient
                                                colors={shopStatus?.isOpen ? ['#00B894', '#009473'] : ['#4A4A4A', '#3A3A3A']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.premiumAddGradient}
                                            >
                                                <Text style={styles.premiumAddText}>
                                                    {shopStatus?.isOpen
                                                        ? `Add Item  |  ${formatCurrency((selectedItem.price + selectedAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0)) * modalQuantity)}`
                                                        : 'STORE CLOSED'}
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontFamily: 'Urbanist_700Bold',
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
        fontFamily: 'Urbanist_400Regular',
        padding: 0,
    },
    categoryWrapper: {
        height: 48,
        marginBottom: 6,
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#252121',
        gap: 6,
        height: 40,
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
        fontFamily: 'Urbanist_600SemiBold',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    menuCardContainer: {
        width: CARD_WIDTH,
        marginBottom: 10,
        marginTop: 40,
    },
    menuCardOuter: {
        backgroundColor: '#252121',
        borderRadius: 20,
        padding: 14,
        paddingTop: 55,
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
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
        borderColor: '#252121',
        backgroundColor: '#2A2A2A',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
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
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Urbanist_700Bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    menuDescriptionCard: {
        color: '#A5A2A2',
        fontSize: 10,
        fontFamily: 'Urbanist_400Regular',
        textAlign: 'center',
        lineHeight: 14,
        marginBottom: 10,
    },
    menuPriceCard: {
        color: '#F36D25',
        fontSize: 18,
        fontFamily: 'Urbanist_700Bold',
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
        fontFamily: 'Urbanist_600SemiBold',
    },
    soldOutPill: {
        backgroundColor: 'rgba(239, 83, 80, 0.15)',
        paddingVertical: 8,
        width: '85%',
        borderRadius: 20,
        alignItems: 'center',
    },
    soldOutPillText: {
        color: '#EF5350',
        fontSize: 12,
        fontFamily: 'Urbanist_600SemiBold',
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
        fontFamily: 'Urbanist_400Regular',
    },
    floatingCartContainer: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    floatingCartBtn: {
        borderRadius: 28,
        overflow: 'hidden',
    },
    floatingCartGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 28,
        gap: 12,
    },
    cartIconBadge: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingCartText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Urbanist_700Bold',
    },
    // Item Detail Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContentPremium: {
        backgroundColor: '#1A1818',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '92%',
        overflow: 'hidden',
    },
    floatingCloseBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailImageContainer: {
        width: '100%',
        height: 300,
    },
    detailImagePremium: {
        width: '100%',
        height: '100%',
    },
    detailInfoContent: {
        padding: 24,
    },
    detailHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    detailNamePremium: {
        fontSize: 24,
        fontFamily: 'Urbanist_700Bold',
        color: '#FFFFFF',
        lineHeight: 30,
        marginBottom: 4,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontFamily: 'Urbanist_700Bold',
        color: '#FF6A00',
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 14,
        fontFamily: 'Urbanist_400Regular',
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    detailPricePremium: {
        fontSize: 22,
        fontFamily: 'Urbanist_700Bold',
        color: '#FFFFFF',
    },
    detailDescriptionPremium: {
        fontSize: 15,
        fontFamily: 'Urbanist_400Regular',
        color: '#A5A2A2',
        lineHeight: 22,
        marginBottom: 24,
    },
    detailChipsRowPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    detailChipPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#252121',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    detailChipValuePremium: {
        fontSize: 12,
        fontFamily: 'Urbanist_600SemiBold',
        color: '#FFFFFF',
    },
    customizationSection: {
        marginBottom: 24,
    },
    customizationLabel: {
        fontSize: 12,
        fontFamily: 'Urbanist_800ExtraBold',
        color: '#757575',
        letterSpacing: 1,
        marginBottom: 12,
    },
    choicesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    choiceChip: {
        backgroundColor: '#252121',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#353030',
    },
    choiceChipActive: {
        backgroundColor: 'rgba(255, 106, 0, 0.15)',
        borderColor: '#FF6A00',
    },
    choiceText: {
        color: '#A5A2A2',
        fontSize: 12,
        fontFamily: 'Urbanist_600SemiBold',
    },
    choiceTextActive: {
        color: '#FF6A00',
    },
    cardClosedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(239, 83, 80, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    cardClosedBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: 'Urbanist_800ExtraBold',
    },
    modalOpensAtText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        fontFamily: 'Urbanist_600SemiBold',
        marginTop: 2,
    },
    // Missing Premium Styles
    detailPlaceholderImage: {
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1A1818',
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#252121',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252121',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#353030',
    },
    qtyBtn: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    qtyText: {
        fontSize: 16,
        fontFamily: 'Urbanist_800ExtraBold',
        color: '#FFFFFF',
        minWidth: 24,
        textAlign: 'center',
    },
    premiumAddBtn: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#00B894',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    premiumAddGradient: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    premiumAddText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
});
