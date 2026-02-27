import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CustomerLoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { sendOtp } = useAuthStore();

    const isValid = phone.trim().length === 10;

    const handleSendOtp = async () => {
        if (isValid) {
            setIsLoading(true);
            try {
                await sendOtp(phone);
                router.push('/(auth)/otp');
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
                    <Text style={styles.title}>Enter your number</Text>
                    <Text style={styles.subtitle}>We'll send you a verification code</Text>

                    {/* Phone Input */}
                    <View style={styles.phoneRow}>
                        <View style={styles.countryCode}>
                            <Text style={styles.countryText}>+91</Text>
                        </View>
                        <View style={styles.phoneInput}>
                            <Ionicons name="call-outline" size={18} color="#757575" />
                            <TextInput
                                placeholder="9876543210"
                                placeholderTextColor="#757575"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                maxLength={10}
                                autoFocus
                                style={styles.textInput}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleSendOtp}
                        disabled={!isValid || isLoading}
                        style={({ pressed }) => [
                            styles.sendButton,
                            (!isValid || isLoading) && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.sendGradient}
                        >
                            <Text style={styles.sendText}>
                                {isLoading ? 'Sending...' : 'Send OTP'}
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
    subtitle: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 36 },
    phoneRow: { flexDirection: 'row', gap: 12 },
    countryCode: {
        backgroundColor: '#1E1E1E', borderRadius: 16, paddingHorizontal: 18, justifyContent: 'center',
        borderWidth: 1, borderColor: '#353030',
    },
    countryText: { color: '#FF6A00', fontSize: 17, fontFamily: 'Inter_700Bold' },
    phoneInput: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#1E1E1E', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18,
        borderWidth: 1, borderColor: '#353030',
    },
    textInput: {
        flex: 1, color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_600SemiBold', padding: 0,
    },
    bottomSection: {
        flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 24,
    },
    sendButton: { borderRadius: 14, overflow: 'hidden' },
    sendGradient: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 14,
    },
    sendText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
