import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';

const SHOP_ADDRESS = "Villianur Main Rd, beside of kv.tex, Natesan Nagar, Puducherry, 605005";
const SHOP_MAPS_URL = "https://maps.app.goo.gl/FHdBWbXMXDW3pe4M6";

const formatCurrency = (amount: number) => `₹${amount}`;

export default function HomeScreen() {
    const router = useRouter();
    const { addItem } = useCartStore();
    const { menuItems, subscribeToMenu } = useMenuStore();
    const { user } = useAuthStore();
    const { status, subscribeToStatus } = useShopStore();

    useEffect(() => {
        const unsubMenu = subscribeToMenu();
        const unsubStatus = subscribeToStatus();
        return () => {
            unsubMenu();
            unsubStatus();
        };
    }, []);


    const userName = user?.name || 'Customer';
    const popularItems = menuItems.filter(item => item.available).slice(0, 6);

    // Pick a featured item for "Today's Special"
    const specialItem = menuItems.find(item => item.isCombo && item.available) || menuItems[0];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome to NightFlame 🔥</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(customer)/profile')}
                        style={styles.profileButton}
                    >
                        <Ionicons name="person-outline" size={24} color="#A5A2A2" />
                    </TouchableOpacity>
                </View>

                {/* Status Board */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.statusBoardWrapper}>
                    <View style={[styles.statusSign, !status?.isOpen && styles.statusSignClosed]}>
                        <View style={styles.signChain} />
                        <View style={styles.signContent}>
                            <Ionicons name={status?.isOpen ? "sunny" : "moon"} size={22} color="#FFFFFF" />
                            <Text style={styles.statusLabelText}>WE'RE {status?.isOpen ? 'OPEN' : 'CLOSED'}</Text>
                        </View>
                        <Text style={styles.timeLabelText}>
                            {status?.isOpen
                                ? `${status.openTime} - ${status.closeTime}`
                                : status?.message || "Come tomorrow to Have Spicy Chicken!"}
                        </Text>
                    </View>
                </Animated.View>

                {/* Location Bar */}
                <TouchableOpacity
                    style={styles.locationBar}
                    onPress={() => { /* Opne Maps link */ }}
                >
                    <View style={styles.locationIcon}>
                        <Ionicons name="location" size={16} color="#FF6A00" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.locationTitle}>Our Location</Text>
                        <Text style={styles.locationText} numberOfLines={2}>{SHOP_ADDRESS}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#757575" />
                </TouchableOpacity>

                {/* Today's Special Banner */}
                {specialItem && (
                    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                        <TouchableOpacity
                            style={styles.specialBanner}
                            onPress={() => router.push('/(customer)/menu')}
                            activeOpacity={0.9}
                        >
                            {specialItem.imageUrl ? (
                                <Image
                                    source={{ uri: specialItem.imageUrl }}
                                    style={styles.specialImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.specialImage, { backgroundColor: '#2A2A2A' }]} />
                            )}
                            <View style={styles.specialOverlay}>
                                <View style={styles.specialBadge}>
                                    <Text style={styles.specialBadgeText}>🔥 TODAY'S SPECIAL</Text>
                                </View>
                                <Text style={styles.specialTitle}>{specialItem.name}</Text>
                                <TouchableOpacity
                                    style={styles.orderNowBtn}
                                    onPress={() => {
                                        addItem(specialItem);
                                        router.push('/(customer)/cart');
                                    }}
                                >
                                    <Text style={styles.orderNowText}>Order Now</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Stats Row */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={styles.statValue}>4.8 Rating</Text>
                        <Text style={styles.statLabel}>200+ reviews</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardMiddle]}>
                        <Ionicons name="time-outline" size={20} color="#90EE90" />
                        <Text style={styles.statValue}>15-20 min</Text>
                        <Text style={styles.statLabel}>Avg prep time</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="fast-food-outline" size={20} color="#FFB380" />
                        <Text style={styles.statValue}>{menuItems.length} Items</Text>
                        <Text style={styles.statLabel}>On menu today</Text>
                    </View>
                </Animated.View>

                {/* Popular Now Section */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="trending-up" size={18} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Popular Now</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(customer)/menu')}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, gap: 16 }}
                    >
                        {popularItems.map((item) => (
                            <TouchableOpacity
                                key={item.itemId}
                                style={styles.popularCardContainer}
                                onPress={() => router.push('/(customer)/menu')}
                                activeOpacity={0.85}
                            >
                                <View style={styles.popularCardOuter}>
                                    {item.imageUrl ? (
                                        <Image source={{ uri: item.imageUrl }} style={styles.popularImageTop} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.popularImageTop, { backgroundColor: '#EAEAEA', alignItems: 'center', justifyContent: 'center' }]}>
                                            <Ionicons name="restaurant" size={24} color="#555" />
                                        </View>
                                    )}
                                    <View style={styles.popularInfoContainer}>
                                        <Text style={styles.popularNameCard} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.popularPriceCard}>{formatCurrency(item.price)}</Text>
                                        <View style={styles.orderButtonWrap}>
                                            <LinearGradient colors={['#F36D25', '#E5580F']} style={styles.orderGradientBtn}>
                                                <Text style={styles.orderBtnText}>Order Now</Text>
                                            </LinearGradient>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1818',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    welcomeText: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        marginTop: 2,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#252121',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252121',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    locationText: {
        color: '#757575',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        lineHeight: 18,
    },
    locationTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 2,
    },
    locationIcon: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    statusBoardWrapper: {
        paddingHorizontal: 20,
        marginBottom: 24,
        alignItems: 'center'
    },
    statusSign: {
        width: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 12,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    statusSignClosed: {
        backgroundColor: '#EF5350',
        shadowColor: '#EF5350',
    },
    signChain: {
        position: 'absolute',
        top: -12,
        width: '60%',
        height: 12,
        borderWidth: 2,
        borderColor: '#353030',
        borderBottomWidth: 0,
        borderRadius: 10,
    },
    signContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    statusLabelText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 2,
    },
    timeLabelText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
    },
    specialBanner: {
        marginHorizontal: 20,
        borderRadius: 20,
        height: 160,
        overflow: 'hidden',
        marginBottom: 20,
    },
    specialImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    specialOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: 20,
        justifyContent: 'center',
    },
    specialBadge: {
        backgroundColor: 'rgba(255, 106, 0, 0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    specialBadgeText: {
        color: '#FF6A00',
        fontSize: 11,
        fontFamily: 'Inter_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    specialTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 12,
    },
    orderNowBtn: {
        backgroundColor: '#FF6A00',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    orderNowText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#252121',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 6,
    },
    statCardMiddle: {
        borderLeftWidth: 0,
        borderRightWidth: 0,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
    },
    statLabel: {
        color: '#757575',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    seeAllText: {
        color: '#FF6A00',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    popularCardContainer: {
        width: 150,
        marginTop: 15,
        marginBottom: 10,
    },
    popularCardOuter: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        paddingTop: 45, // space for drifting image
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        minHeight: 160,
        justifyContent: 'space-between'
    },
    popularImageTop: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: 'absolute',
        top: -40,
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    popularInfoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    popularNameCard: {
        color: '#1A1A1A',
        fontSize: 13,
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    popularPriceCard: {
        color: '#F36D25',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 10,
    },
    orderButtonWrap: {
        width: '90%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#F36D25',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    orderGradientBtn: {
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
    }
});
