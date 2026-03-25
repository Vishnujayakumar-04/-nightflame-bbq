import { View, Text, Dimensions, StyleSheet, Pressable, TextInput, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AdminLoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { adminLogin } = useAuthStore();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) return;
        setIsLoading(true);
        setError('');

        try {
            const success = await adminLogin(email, password);
            if (success) {
                router.replace('/(admin)/dashboard');
            } else {
                setError('Invalid Email or Password. Try again.');
            }
        } catch {
            setError('Login failed. Please try again.');
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

                {/* Admin Access Form */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.contentSection}>
                    <Text style={styles.title}>Admin Access</Text>
                    <Text style={styles.description}>Sign in with your admin credentials</Text>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={18} color="#757575" />
                            <TextInput
                                placeholder="admin@example.com"
                                placeholderTextColor="#757575"
                                value={email}
                                onChangeText={(val) => { setEmail(val); setError(''); }}
                                style={styles.textInput}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={18} color="#757575" />
                            <TextInput
                                placeholder="Enter password"
                                placeholderTextColor="#757575"
                                value={password}
                                onChangeText={(val) => { setPassword(val); setError(''); }}
                                style={styles.textInput}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Forward Pass */}
                    <Pressable
                        onPress={handleLogin}
                        disabled={!email || !password || isLoading}
                        style={({ pressed }) => [
                            styles.loginButton,
                            (!email || !password || isLoading) && { opacity: 0.5 },
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

                    {/* Demo hint removed per user request */}
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#E0E0E0',
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#353030',
    },
    textInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        padding: 0,
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
});
