import { View, Text, Dimensions, StyleSheet, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 4;

export default function AdminLoginScreen() {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<TextInput>(null);
    const { adminLogin } = useAuthStore();

    const handlePinChange = (value: string) => {
        if (value.length <= PIN_LENGTH) {
            setPin(value);
            setError('');
        }
    };

    const handleLogin = async () => {
        if (pin.length !== PIN_LENGTH) return;
        setIsLoading(true);
        setError('');

        try {
            const success = await adminLogin(pin);
            if (success) {
                router.replace('/(admin)/dashboard');
            } else {
                setError('Invalid PIN. Try again.');
                setPin('');
            }
        } catch {
            setError('Login failed. Please try again.');
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

                {/* Logo Header */}
                <Animated.View entering={FadeIn.duration(800)} style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/logo_brand.png')}
                        style={styles.logo}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                    />
                    <Text style={styles.subtitle}>Roadside BBQ • Est. 2019</Text>
                </Animated.View>

                {/* Back Button */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={18} color="#A5A2A2" />
                        <Text style={styles.backText}>Back</Text>
                    </Pressable>
                </Animated.View>

                {/* Admin Access */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.contentSection}>
                    <Text style={styles.title}>Admin Access</Text>
                    <Text style={styles.description}>Enter your 4-digit staff PIN</Text>

                    {/* PIN Display */}
                    <Pressable
                        onPress={() => inputRef.current?.focus()}
                        style={styles.pinContainer}
                    >
                        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.pinDot,
                                    pin.length > index && styles.pinDotFilled,
                                ]}
                            />
                        ))}
                    </Pressable>

                    {/* Hidden TextInput */}
                    <TextInput
                        ref={inputRef}
                        value={pin}
                        onChangeText={handlePinChange}
                        keyboardType="number-pad"
                        maxLength={PIN_LENGTH}
                        autoFocus
                        style={styles.hiddenInput}
                    />

                    {/* Error Message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Enter Admin Panel Button */}
                    <Pressable
                        onPress={handleLogin}
                        disabled={pin.length !== PIN_LENGTH || isLoading}
                        style={({ pressed }) => [
                            styles.loginButton,
                            (pin.length !== PIN_LENGTH || isLoading) && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            <Text style={styles.loginText}>
                                {isLoading ? 'Verifying...' : 'Enter Admin Panel →'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Demo hint */}
                    <Text style={styles.demoText}>Demo PIN: 1234</Text>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        paddingTop: 16,
        marginBottom: 20,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.35,
    },
    subtitle: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        marginTop: -4,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 8,
        gap: 6,
    },
    backText: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
    },
    contentSection: {
        paddingHorizontal: 24,
        marginTop: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 6,
    },
    description: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        marginBottom: 36,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 40,
        marginBottom: 8,
        gap: 24,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3A3A3A',
    },
    pinDotFilled: {
        backgroundColor: '#FF6A00',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
    },
    errorText: {
        color: '#EF5350',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginTop: 12,
    },
    loginButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 32,
        shadowColor: '#FF6A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    loginGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 0.5,
    },
    demoText: {
        color: '#5A4030',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginTop: 20,
    },
});
