import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { getMenuItemImage } from '../../constants/menuImages';
import { MenuItem } from '../../types/models';



const SHOP_ADDRESS = "Villianur Main Rd, beside of kv.tex, Natesan Nagar, Puducherry, 605005";
const SHOP_MAPS_URL = "https://maps.app.goo.gl/FHdBWbXMXDW3pe4M6";

const formatCurrency = (amount: number) => `₹${amount}`;

const CARD_WIDTH = 160;
const CARD_GAP = 16;
const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;

// Individual Popular Item Card Component
const PopularItemCard = ({ item, status, router }: { item: MenuItem; status: any; router: any }) => {
    return (
        <TouchableOpacity
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
    );
};

// Continuous Marquee Component for Item Cards
const PopularMarquee = ({ items, status, router }: { items: MenuItem[]; status: any; router: any }) => {
    const listWidth = items.length * ITEM_WIDTH;
    const translateX = useSharedValue(0);

    useEffect(() => {
        let isCancelled = false;

        const runAnimation = (currentStep: number) => {
            if (isCancelled) return;

            // Calculate next target position
            const nextStep = currentStep + 1;
            const targetX = -nextStep * ITEM_WIDTH;

            translateX.value = withDelay(
                3000, // Pause for 3 seconds on each item
                withTiming(targetX, {
                    duration: 1000, // Slide for 1 second
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }, (finished) => {
                    if (finished && !isCancelled) {
                        // If we reached the end of the first set, jump to 0 instantly (seamless loop)
                        if (nextStep >= items.length) {
                            translateX.value = 0;
                            runOnJS(runAnimation)(0);
                        } else {
                            runOnJS(runAnimation)(nextStep);
                        }
                    }
                })
            );
        };

        // Start from step 0
        runAnimation(0);

        return () => {
            isCancelled = true;
        };
    }, [items.length, listWidth]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.marqueeWrapper}>
            <Animated.View style={[styles.marqueeInnerRow, animatedStyle]}>
                {/* First set of items */}
                {items.map((item) => (
                    <PopularItemCard key={item.itemId} item={item} status={status} router={router} />
                ))}
                {/* Second set of items for seamless looping */}
                {items.map((item) => (
                    <PopularItemCard key={`${item.itemId}-dup`} item={item} status={status} router={router} />
                ))}
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
        <LinearGradient colors={['#1A1818', '#1D1510']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.userName}>{userName}</Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            activeOpacity={0.8}
                            onPress={() => router.push('/(customer)/shop-details')}
                        >
                            <Image
                                source={require('../../assets/LOGO.png')}
                                style={styles.shopBtnImage}
                                resizeMode="cover"
                            />
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
                            {status?.isOpen && (
                                <View style={styles.bannerPrepPill}>
                                    <Text style={styles.bannerPrepText}>⚡ Ready in 15-20 mins</Text>
                                </View>
                            )}
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

                        <PopularMarquee items={popularItems} status={status} router={router} />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: 26,
        fontFamily: 'Poppins_700Bold',
        fontStyle: 'italic',
    },
    shopBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 106, 0, 0.3)',
        elevation: 4,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    shopBtnImage: {
        width: '100%',
        height: '100%',
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
        fontFamily: 'Urbanist_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    specialTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Urbanist_700Bold',
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
        fontFamily: 'Urbanist_700Bold',
    },
    bannerPrepPill: {
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    bannerPrepText: {
        color: '#4CAF50',
        fontSize: 12,
        fontFamily: 'Urbanist_800ExtraBold',
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
        fontFamily: 'Urbanist_700Bold',
    },
    seeAllText: {
        color: '#FF6A00',
        fontSize: 14,
        fontFamily: 'Urbanist_600SemiBold',
    },
    popularCardContainer: {
        width: CARD_WIDTH,
        marginRight: CARD_GAP,
        marginTop: 45,
        marginBottom: 10,
    },
    marqueeWrapper: {
        width: '100%',
        overflow: 'hidden',
        paddingBottom: 20,
    },
    marqueeInnerRow: {
        flexDirection: 'row',
        paddingLeft: 20,
    },
    popularCardOuter: {
        backgroundColor: '#252121',
        borderRadius: 20,
        padding: 12,
        paddingTop: 45, // space for drifting image
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        borderColor: '#252121',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    popularInfoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    popularNameCard: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Urbanist_700Bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    popularPriceCard: {
        color: '#F36D25',
        fontSize: 16,
        fontFamily: 'Urbanist_700Bold',
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
        fontFamily: 'Urbanist_600SemiBold',
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
        fontFamily: 'Urbanist_700Bold',
        letterSpacing: 1,
        textAlign: 'center',
    },
    opensAtText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 8,
        fontFamily: 'Urbanist_600SemiBold',
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
        fontFamily: 'Urbanist_800ExtraBold',
    }
});
