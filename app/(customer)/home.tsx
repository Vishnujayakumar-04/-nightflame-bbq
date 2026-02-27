import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const formatCurrency = (amount: number) => `₹${amount}`;

export default function HomeScreen() {
    const router = useRouter();
    const { addItem } = useCartStore();
    const { menuItems, subscribeToMenu } = useMenuStore();
    const { user } = useAuthStore();

    useEffect(() => {
        const unsubscribe = subscribeToMenu();
        return unsubscribe;
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
                        <Text style={styles.welcomeText}>Welcome back 👋</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(customer)/profile')}
                        style={styles.profileButton}
                    >
                        <Ionicons name="flame" size={24} color="#FF6A00" />
                    </TouchableOpacity>
                </View>

                {/* Location Bar */}
                <View style={styles.locationBar}>
                    <Ionicons name="location-outline" size={16} color="#FF6A00" />
                    <Text style={styles.locationText}>MG Road, Near Bus Stand • Open until 11 PM</Text>
                </View>

                {/* Today's Special Banner */}
                {specialItem && (
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
                )}

                {/* Stats Row */}
                <View style={styles.statsRow}>
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
                </View>

                {/* Popular Now Section */}
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
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
                >
                    {popularItems.map((item) => (
                        <TouchableOpacity
                            key={item.itemId}
                            style={styles.popularCard}
                            onPress={() => router.push('/(customer)/menu')}
                            activeOpacity={0.85}
                        >
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.popularImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.popularImage, { backgroundColor: '#2A2A2A' }]}>
                                    <Ionicons name="restaurant" size={28} color="#555" />
                                </View>
                            )}
                            <View style={styles.popularInfo}>
                                <View style={styles.vegBadge}>
                                    <View style={[styles.vegDot, { backgroundColor: item.category === 'Combo' ? '#FF6A00' : '#4CAF50' }]} />
                                </View>
                                <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.popularPrice}>{formatCurrency(item.price)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

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
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        flex: 1,
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
    popularCard: {
        width: width * 0.42,
        backgroundColor: '#252121',
        borderRadius: 16,
        overflow: 'hidden',
    },
    popularImage: {
        width: '100%',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    popularInfo: {
        padding: 12,
    },
    vegBadge: {
        marginBottom: 4,
    },
    vegDot: {
        width: 10,
        height: 10,
        borderRadius: 2,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    popularName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 4,
    },
    popularPrice: {
        color: '#FF6A00',
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
    },
});
