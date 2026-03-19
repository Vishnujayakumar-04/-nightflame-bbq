import { View, Text, Image, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MARQUEE_IMAGES_ROW1 = [
    require('../../assets/Menu/single/chicken_lollipop.png'),
    require('../../assets/Menu/single/grilled_drumstick.png'),
    require('../../assets/Menu/combo/mega_grill_combo.png'),
    require('../../assets/Menu/single/grilled_leg.png'),
];

const MARQUEE_IMAGES_ROW2 = [
    require('../../assets/Menu/single/chicken_wings.png'),
    require('../../assets/Menu/combo/grill_mix_combo.png'),
    require('../../assets/Menu/single/grilled_thigh.png'),
    require('../../assets/Menu/combo/family_combo.png'),
];

const ImageMarqueeRow = ({ images, duration, reverse = false }: { images: any[], duration: number, reverse?: boolean }) => {
    const translateX = useSharedValue(0);
    const itemWidth = width * 0.45;
    const totalWidth = itemWidth * images.length;

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(reverse ? totalWidth : -totalWidth, {
                duration: duration,
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
        <View style={styles.marqueeRowContainer}>
            <Animated.View style={[styles.marqueeRow, animatedStyle]}>
                {[...images, ...images, ...images].map((img, idx) => (
                    <View key={idx} style={styles.marqueeItem}>
                        <Image source={img} style={styles.marqueeImage} resizeMode="cover" />
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Background Marquee */}
            <View style={styles.marqueeBackground}>
                <ImageMarqueeRow images={MARQUEE_IMAGES_ROW1} duration={20000} />
                <ImageMarqueeRow images={MARQUEE_IMAGES_ROW2} duration={25000} reverse />
                <ImageMarqueeRow images={MARQUEE_IMAGES_ROW1} duration={22000} />
            </View>

            {/* Premium Gradient Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(10,10,10,0.4)', 'rgba(10,10,10,0.8)', '#0A0A0A', '#0A0A0A']}
                style={styles.gradientOverlay}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    <Animated.View entering={FadeIn.duration(1200)} style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.taglineWrapper}>
                            <View style={styles.line} />
                            <Text style={styles.tagline}>PRE-ORDER • PICK UP • FEEL THE FLAME</Text>
                            <View style={styles.line} />
                        </View>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.footer}>
                    <Pressable
                        onPress={() => router.push('/(auth)/role-selection')}
                        style={({ pressed }) => [
                            styles.buttonContainer,
                            pressed && { transform: [{ scale: 0.98 }] }
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>GET STARTED</Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    marqueeBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        opacity: 0.5,
        paddingTop: 40,
    },
    marqueeRowContainer: {
        height: width * 0.45,
        marginBottom: 15,
        overflow: 'hidden',
    },
    marqueeRow: {
        flexDirection: 'row',
    },
    marqueeItem: {
        width: width * 0.45,
        height: width * 0.45,
        padding: 6,
    },
    marqueeImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    taglineWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        gap: 10,
    },
    line: {
        height: 1,
        width: 25,
        backgroundColor: '#FF6A00',
        opacity: 0.5,
    },
    tagline: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 1.5,
        textAlign: 'center',
        opacity: 0.9,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 50,
        width: '100%',
        zIndex: 10,
    },
    buttonContainer: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 2,
    },
});
