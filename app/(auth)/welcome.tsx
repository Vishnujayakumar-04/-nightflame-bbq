import { View, Text, Image, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    // Pulse animation value for the logo
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1, // infinite
            true // reverse
        );
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    <Animated.View entering={FadeIn.duration(1000)} style={[styles.logoContainer, animatedLogoStyle]}>
                        <Image
                            source={require('../../assets/LOGO.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.tagline}>Pre-order. Pick up. Feel the Flame.</Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.footer}>
                    <Pressable
                        onPress={() => router.push('/(auth)/role-selection')}
                        style={({ pressed }) => [
                            styles.buttonContainer,
                            pressed && { transform: [{ scale: 0.96 }] }
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
        backgroundColor: '#050505', // Very dark to make the glow pop
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.5,
        height: width * 0.5,
    },
    tagline: {
        color: '#555555',
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginTop: 0,
        letterSpacing: 0.5,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        width: '100%',
    },
    buttonContainer: {
        width: '100%',
        borderRadius: 16,
        elevation: 8, // Shadow for Android
        shadowColor: '#FF6A00', // Colored shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        backgroundColor: '#FF6A00', // Needed for elevation to show on android
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 1.5,
    },
});
