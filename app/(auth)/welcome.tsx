import { View, Text, Image, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    <Animated.View entering={FadeIn.duration(1000)} style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/LOGO.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.tagline}>Pre-order. Pick up. Feel the Flame.</Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.footer}>
                    {/* Simulated Glow Effects behind the button */}
                    <View style={styles.glowOuter} />
                    <View style={styles.glowInner} />

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
    },
    logo: {
        width: width * 0.7,
        height: width * 0.7,
    },
    tagline: {
        color: '#555555',
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginTop: -10,
        letterSpacing: 0.5,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowOuter: {
        position: 'absolute',
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(255, 106, 0, 0.25)',
        borderRadius: 30,
        bottom: 64,
        transform: [{ scaleX: 1.15 }, { scaleY: 1.6 }],
    },
    glowInner: {
        position: 'absolute',
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(229, 59, 10, 0.4)',
        borderRadius: 30,
        bottom: 64,
        transform: [{ scaleX: 1.05 }, { scaleY: 1.3 }],
    },
    buttonContainer: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 1.5,
    },
});
