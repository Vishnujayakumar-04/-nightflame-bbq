import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function NotificationPermissionScreen() {
    const router = useRouter();

    const requestPermission = async () => {
        try {
            await Notifications.requestPermissionsAsync();
        } catch {
            // Silently handle — permission may not be available
        }
        router.replace('/(customer)/home');
    };

    const handleSkip = () => {
        router.replace('/(customer)/home');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    {/* Character Illustration */}
                    <Animated.View
                        entering={FadeInDown.duration(800).delay(200)}
                        style={styles.illustrationContainer}
                    >
                        <Image
                            source={require('../../assets/images/onboarding/delivery_character.png')}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* Text Section */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(400)}
                        style={styles.textSection}
                    >
                        <Text style={styles.title}>Get updates on your order status</Text>
                        <Text style={styles.subtitle}>
                            Allow push notifications to get real-time updates on your order status.
                        </Text>
                    </Animated.View>

                    {/* Actions Section */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(600)}
                        style={styles.actions}
                    >
                        <Pressable
                            onPress={requestPermission}
                            style={({ pressed }) => [
                                styles.button,
                                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                            ]}
                        >
                            <LinearGradient
                                colors={['#FF6A00', '#E53B0A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Turn on Notification</Text>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            onPress={handleSkip}
                            style={({ pressed }) => [
                                styles.skipButton,
                                pressed && { opacity: 0.7 }
                            ]}
                        >
                            <Text style={styles.skipText}>Not Now</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationContainer: {
        width: width * 0.8,
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    illustration: {
        width: '100%',
        height: '100%',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 80,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 24,
    },
    actions: {
        width: '100%',
        gap: 20,
        alignItems: 'center',
    },
    button: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    skipButton: {
        paddingVertical: 10,
    },
    skipText: {
        color: '#FF6A00',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
});
