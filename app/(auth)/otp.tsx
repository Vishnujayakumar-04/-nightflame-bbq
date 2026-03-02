import { View, Text, TouchableOpacity, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { verifyOtp, phoneNumber, error } = useAuthStore();

    const isValid = otp.length === 6;

    useEffect(() => {
        if (otp.length === 6 && !isLoading) {
            handleVerify();
        }
    }, [otp]);

    const handleVerify = async () => {
        if (isValid) {
            setIsLoading(true);
            try {
                const isNewUser = await verifyOtp(otp);
                if (isNewUser) {
                    router.replace('/(auth)/register');
                } else {
                    router.replace('/(customer)/home');
                }
            } catch {
                // Error handled in store
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Back */}
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={18} color="#A5A2A2" />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>

                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.content}>
                    <Text style={styles.title}>Enter PIN</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit verification PIN for{'\n'}+91 {phoneNumber || '**********'}
                    </Text>

                    {/* PIN Input */}
                    <View style={styles.otpContainer}>
                        <TextInput
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="------"
                            placeholderTextColor="#3A3A3A"
                            autoFocus
                            style={styles.otpInput}
                        />
                    </View>

                    {/* Hint */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <Text style={styles.hintText}>Demo PIN: 123456</Text>
                    )}
                </Animated.View>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleVerify}
                        disabled={!isValid || isLoading}
                        style={({ pressed }) => [
                            styles.verifyButton,
                            (!isValid || isLoading) && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.verifyGradient}
                        >
                            <Text style={styles.verifyText}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D' },
    safeArea: { flex: 1 },
    backButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 12, gap: 6,
    },
    backText: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular' },
    content: { paddingHorizontal: 24, marginTop: 24 },
    title: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
    subtitle: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 36, lineHeight: 22 },
    otpContainer: {
        backgroundColor: '#1E1E1E', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 20,
        marginBottom: 20, borderWidth: 1, borderColor: '#353030',
    },
    otpInput: {
        color: '#FFFFFF', fontSize: 32, fontFamily: 'Inter_700Bold', marginLeft: 16,
        textAlign: 'center', padding: 0,
    },
    errorText: { color: '#EF5350', fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center', marginBottom: 8 },
    hintText: { color: '#5A4030', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
    bottomSection: {
        flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 24,
    },
    verifyButton: { borderRadius: 14, overflow: 'hidden' },
    verifyGradient: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 14,
    },
    verifyText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
