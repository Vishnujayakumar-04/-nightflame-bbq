import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { getMenuItemImage } from '../../constants/menuImages';
import { MenuItem } from '../../types/models';

const { width } = Dimensions.get('window');

const SHOP_ADDRESS = "Villianur Main Rd, beside of kv.tex, Natesan Nagar, Puducherry, 605005";
const SHOP_MAPS_URL = "https://maps.app.goo.gl/FHdBWbXMXDW3pe4M6";

const formatCurrency = (amount: number) => `₹${amount}`;

// Marquee Component
const MarqueeText = () => {
    const translateX = useSharedValue(width);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(-width * 2, {
                duration: 15000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.marqueeContainer}>
            <Animated.View style={[styles.marqueeInner, animatedStyle]}>
                <Text style={styles.marqueeText}>
                    🔥 NEW: Peri Peri Wings now available! • 📢 FLAT 10% OFF on all Combos! • 🍗 Try our signature BBQ Grilled Bone-In Chicken! • 🔥 NEW: Peri Peri Wings now available! • 📢 FLAT 10% OFF on all Combos!
                </Text>
            </Animated.View>
        </View>
    );
};

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
    const popularItems = menuItems.filter((item: MenuItem) => item.available).slice(0, 6);

    // Pick the admin-set special or fall back to first combo, then first item
    const specialItem = (status?.todaySpecialItemId
        ? menuItems.find((item: MenuItem) => item.itemId === status.todaySpecialItemId && item.available)
        : null)
        || menuItems.find((item: MenuItem) => item.isCombo && item.available)
        || menuItems[0];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.userName}>{userName}</Text>
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
                    onPress={() => {
                        Linking.openURL(SHOP_MAPS_URL).catch(() => { });
                    }}
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
                            style={[styles.specialBanner, !status?.isOpen && { opacity: 0.8 }]}
                            onPress={() => router.push('/(customer)/menu')}
                            activeOpacity={status?.isOpen ? 0.9 : 1}
                            disabled={!status?.isOpen}
                        >
                            {(() => {
                                const localImg = getMenuItemImage(specialItem.name);
                                if (specialItem.imageUrl) {
                                    return <Image source={{ uri: specialItem.imageUrl }} style={styles.specialImage} resizeMode="cover" />;
                                } else if (localImg) {
                                    return <Image source={localImg} style={styles.specialImage} resizeMode="cover" />;
                                } else {
                                    return <View style={[styles.specialImage, { backgroundColor: '#2A2A2A' }]} />;
                                }
                            })()}
                            <View style={styles.specialOverlay}>
                                <View style={styles.specialBadge}>
                                    <Text style={styles.specialBadgeText}>🔥 TODAY'S SPECIAL</Text>
                                </View>
                                <Text style={styles.specialTitle}>{specialItem.name}</Text>
                                <TouchableOpacity
                                    style={[styles.orderNowBtn, !status?.isOpen && styles.orderNowBtnDisabled]}
                                    onPress={() => {
                                        if (!status?.isOpen) return;
                                        addItem(specialItem);
                                        router.push('/(customer)/cart');
                                    }}
                                    disabled={!status?.isOpen}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        {!status?.isOpen && <Ionicons name="lock-closed" size={14} color="#FFFFFF" />}
                                        <Text style={styles.orderNowText}>
                                            {status?.isOpen ? 'Order Now' : 'Store Closed'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {!status?.isOpen && (
                                    <View style={styles.closedOverlayLabel}>
                                        <Text style={styles.closedOverlayText}>CURRENTLY CLOSED</Text>
                                        <Text style={styles.opensAtText}>Opens at {status?.openTime || '6:00 PM'}</Text>
                                    </View>
                                )}
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
                                style={[styles.popularCardContainer, !status?.isOpen && { opacity: 0.85 }]}
                                onPress={() => status?.isOpen && router.push('/(customer)/menu')}
                                activeOpacity={status?.isOpen ? 0.85 : 1}
                                disabled={!status?.isOpen}
                            >
                                <View style={styles.popularCardOuter}>
                                    {(() => {
                                        const localImg = getMenuItemImage(item.name);
                                        if (item.imageUrl) {
                                            return <Image source={{ uri: item.imageUrl }} style={styles.popularImageTop} resizeMode="cover" />;
                                        } else if (localImg) {
                                            return <Image source={localImg} style={styles.popularImageTop} resizeMode="cover" />;
                                        } else {
                                            return (
                                                <View style={[styles.popularImageTop, { backgroundColor: '#EAEAEA', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Ionicons name="restaurant" size={24} color="#555" />
                                                </View>
                                            );
                                        }
                                    })()}
                                    <View style={styles.popularInfoContainer}>
                                        <Text style={styles.popularNameCard} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.popularPriceCard}>{formatCurrency(item.price)}</Text>
                                        <View style={styles.orderButtonWrap}>
                                            <LinearGradient
                                                colors={status?.isOpen ? ['#F36D25', '#E5580F'] : ['#4A4A4A', '#3A3A3A']}
                                                style={styles.orderGradientBtn}
                                            >
                                                <Text style={styles.orderBtnText}>
                                                    {status?.isOpen ? 'Order Now' : 'Closed'}
                                                </Text>
                                            </LinearGradient>
                                        </View>
                                        {!status?.isOpen && (
                                            <View style={styles.popularClosedBadge}>
                                                <Text style={styles.popularClosedBadgeText}>CLOSED</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Marquee Moved Here */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                    <MarqueeText />
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
    userName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
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
        marginBottom: 20,
        alignItems: 'center'
    },
    statusSign: {
        width: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    statusSignClosed: {
        backgroundColor: '#EF5350',
        shadowColor: '#EF5350',
    },
    signChain: {
        position: 'absolute',
        top: -10,
        width: '50%',
        height: 10,
        borderWidth: 2,
        borderColor: '#353030',
        borderBottomWidth: 0,
        borderRadius: 8,
    },
    signContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    statusLabelText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 2,
    },
    timeLabelText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
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
    },
    marqueeContainer: {
        height: 36,
        backgroundColor: '#252121',
        marginVertical: 10,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    marqueeInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    marqueeText: {
        color: '#FF6A00',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.5,
    },
    orderNowBtnDisabled: {
        backgroundColor: '#4A4A4A',
    },
    closedOverlayLabel: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(239, 83, 80, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    closedOverlayText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 1,
        textAlign: 'center',
    },
    opensAtText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 8,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 2,
        textAlign: 'center',
    },
    popularClosedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(239, 83, 80, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    popularClosedBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: 'Inter_800ExtraBold',
    }
});
