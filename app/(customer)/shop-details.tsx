import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeInUp, ZoomIn, SlideInRight } from 'react-native-reanimated';
import { useShopStore } from '../../store/shopStore';
import { useState } from 'react';

const { width } = Dimensions.get('window');
const PHOTO_WIDTH = width * 0.72;
const PHOTO_GAP = 12;

const SHOP_NAME = 'NightFlame BBQ';
const SHOP_TAGLINE = 'Where Flavor Meets Fire';
const SHOP_ADDRESS = 'Villianur Main Rd, beside of kv.tex, Natesan Nagar, Puducherry, 605005';
const SHOP_PHONE = '+919894402440';
const SHOP_MAPS_URL = 'https://maps.app.goo.gl/FHdBWbXMXDW3pe4M6';

const SHOP_PHOTOS = [
    require('../../assets/shopphoto/1.jpeg'),
    require('../../assets/shopphoto/2.jpeg'),
    require('../../assets/shopphoto/3.jpeg'),
    require('../../assets/shopphoto/2023-04-19 (1).jpeg'),
    require('../../assets/shopphoto/2024-03-10 (1).jpeg'),
];

export default function ShopDetailsScreen() {
    const router = useRouter();
    const { status } = useShopStore();
    const [activePhoto, setActivePhoto] = useState(0);

    const handleScroll = (event: any) => {
        const idx = Math.round(event.nativeEvent.contentOffset.x / (PHOTO_WIDTH + PHOTO_GAP));
        if (idx !== activePhoto) setActivePhoto(idx);
    };

    return (
        <LinearGradient colors={['#1A1818', '#1D1510']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>About Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                    {/* Hero */}
                    <Animated.View entering={ZoomIn.duration(500)} style={s.hero}>
                        <LinearGradient
                            colors={['rgba(255,106,0,0.15)', 'transparent']}
                            style={s.heroBg}
                        />
                        <View style={s.logoRing}>
                            <Image source={require('../../assets/LOGO.png')} style={s.logo} resizeMode="contain" />
                        </View>
                        <Text style={s.shopName}>{SHOP_NAME}</Text>
                        <Text style={s.tagline}>{SHOP_TAGLINE}</Text>
                        <View style={[s.statusChip, {
                            backgroundColor: status?.isOpen ? 'rgba(76,175,80,0.1)' : 'rgba(239,83,80,0.1)',
                            borderColor: status?.isOpen ? 'rgba(76,175,80,0.3)' : 'rgba(239,83,80,0.3)',
                        }]}>
                            <View style={[s.statusDot, { backgroundColor: status?.isOpen ? '#4CAF50' : '#EF5350' }]} />
                            <Text style={[s.statusLabel, { color: status?.isOpen ? '#4CAF50' : '#EF5350' }]}>
                                {status?.isOpen ? 'Open Now' : 'Closed'}
                            </Text>
                            {status?.isOpen && (
                                <Text style={s.statusTime}> · {status.openTime} – {status.closeTime}</Text>
                            )}
                        </View>
                    </Animated.View>

                    {/* Gallery — Horizontal cards with staggered enter animation */}
                    <View style={s.sectionRow}>
                        <Ionicons name="images-outline" size={16} color="#FF6A00" />
                        <Text style={s.sectionLabel}>Gallery</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                        snapToInterval={PHOTO_WIDTH + PHOTO_GAP}
                        decelerationRate="fast"
                    >
                        {SHOP_PHOTOS.map((photo, idx) => (
                            <Animated.View
                                key={idx}
                                entering={ZoomIn.duration(400).delay(idx * 150).springify()}
                                style={{ marginRight: idx < SHOP_PHOTOS.length - 1 ? PHOTO_GAP : 0 }}
                            >
                                <Image source={photo} style={s.galleryImg} resizeMode="cover" />
                            </Animated.View>
                        ))}
                    </ScrollView>
                    <View style={s.dots}>
                        {SHOP_PHOTOS.map((_, idx) => (
                            <View key={idx} style={[s.dot, idx === activePhoto && s.dotActive]} />
                        ))}
                    </View>

                    {/* Contact */}
                    <View style={s.sectionRow}>
                        <Ionicons name="call-outline" size={16} color="#FF6A00" />
                        <Text style={s.sectionLabel}>Contact</Text>
                    </View>
                    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={s.card}>
                        <View style={s.row}>
                            <View style={[s.rowIcon, { backgroundColor: 'rgba(255,106,0,0.08)' }]}>
                                <Ionicons name="location-sharp" size={18} color="#FF6A00" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowLabel}>ADDRESS</Text>
                                <Text style={s.rowValue}>{SHOP_ADDRESS}</Text>
                            </View>
                        </View>
                        <View style={s.divider} />
                        <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`tel:${SHOP_PHONE}`)}>
                            <View style={[s.rowIcon, { backgroundColor: 'rgba(76,175,80,0.08)' }]}>
                                <Ionicons name="call-sharp" size={18} color="#4CAF50" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowLabel}>PHONE</Text>
                                <Text style={s.rowValue}>+91 98944 02440</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#555" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Story */}
                    <View style={s.sectionRow}>
                        <Ionicons name="flame-outline" size={16} color="#FF6A00" />
                        <Text style={s.sectionLabel}>Our Story</Text>
                    </View>
                    <Animated.View entering={FadeInDown.duration(400).delay(300)} style={s.card}>
                        <Text style={s.storyText}>
                            NightFlame BBQ brings you the authentic taste of flame-grilled chicken and smoky BBQ flavors.
                            Our passion for perfectly seasoned, charcoal-cooked meat drives everything we do.
                        </Text>
                        <Text style={[s.storyText, { marginTop: 12 }]}>
                            Every piece is marinated with our signature blend of spices and slow-cooked over open flames
                            to deliver that irresistible smoky, juicy goodness — every bite is crafted with love.
                        </Text>
                    </Animated.View>

                    {/* CTA */}
                    <Animated.View entering={FadeInUp.duration(400).delay(400)} style={{ paddingHorizontal: 24, marginTop: 20 }}>
                        <TouchableOpacity style={s.cta} activeOpacity={0.85} onPress={() => Linking.openURL(SHOP_MAPS_URL)}>
                            <LinearGradient
                                colors={['#FF6A00', '#E53B0A']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={s.ctaGrad}
                            >
                                <Ionicons name="navigate" size={18} color="#FFF" />
                                <Text style={s.ctaText}>Get Directions</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 52,
    },
    backBtn: { padding: 4, marginLeft: -8 },
    headerTitle: { color: '#FFF', fontSize: 20, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },

    // Hero
    hero: { alignItems: 'center', paddingBottom: 24, position: 'relative', overflow: 'hidden' },
    heroBg: { ...StyleSheet.absoluteFillObject },
    logoRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 2, borderColor: 'rgba(255,106,0,0.3)',
        padding: 3, marginBottom: 12, backgroundColor: '#1A1818',
    },
    logo: { width: '100%', height: '100%', borderRadius: 42 },
    shopName: { color: '#FFF', fontSize: 28, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    tagline: { color: '#999', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 14 },
    statusChip: {
        flexDirection: 'row', alignItems: 'center', gap: 7,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
    statusTime: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#999' },

    // Section header
    sectionRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 24, marginTop: 20, marginBottom: 12,
    },
    sectionLabel: { color: '#FFF', fontSize: 17, fontFamily: 'Poppins_700Bold' },

    // Gallery
    galleryImg: {
        width: PHOTO_WIDTH, height: 180,
        borderRadius: 16, backgroundColor: '#252121',
    },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#353030' },
    dotActive: { backgroundColor: '#FF6A00', width: 20, borderRadius: 5 },

    // Card
    card: {
        marginHorizontal: 24, backgroundColor: '#252121',
        borderRadius: 18, borderWidth: 1, borderColor: '#353030',
        overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { color: '#757575', fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 2 },
    rowValue: { color: '#FFF', fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 19 },
    divider: { height: 1, backgroundColor: '#353030', marginLeft: 64 },

    // Story
    storyText: { color: '#C8C4C4', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 22, paddingHorizontal: 16, paddingVertical: 4 },

    // CTA
    cta: { borderRadius: 14, overflow: 'hidden' },
    ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
    ctaText: { color: '#FFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
});
