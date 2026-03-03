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
    const [phoneError, setPhoneError] = useState('');
    const { sendOtp } = useAuthStore();

    const handleSendOtp = async () => {
        if (phone.trim().length !== 10) {
            setPhoneError('Please enter a valid 10-digit phone number');
            return;
        }

        setPhoneError('');
        setIsLoading(true);
        try {
            await sendOtp(phone);
            router.push('/(auth)/otp');
        } catch {
            // Error handled in store
        } finally {
            setIsLoading(false);
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
                    <Text style={styles.title}>Your Phone</Text>
                    <Text style={styles.subtitle}>Enter your 10-digit mobile number to continue</Text>

                    {/* Phone Input */}
                    <View style={styles.phoneRow}>
                        <View style={styles.countryCode}>
                            <Text style={styles.countryText}>+91</Text>
                        </View>
                        <View style={[styles.phoneInput, phoneError ? { borderColor: '#EF5350' } : {}]}>
                            <Ionicons name="call-outline" size={18} color={phoneError ? '#EF5350' : '#757575'} />
                            <TextInput
                                placeholder="9876543210"
                                placeholderTextColor="#757575"
                                value={phone}
                                onChangeText={(t) => {
                                    setPhone(t.replace(/\D/g, ''));
                                    if (t.length === 10) setPhoneError('');
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                                autoFocus
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    {phoneError ? (
                        <Text style={styles.errorText}>{phoneError}</Text>
                    ) : null}
                </Animated.View>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleSendOtp}
                        disabled={isLoading}
                        style={({ pressed }) => [
                            styles.sendButton,
                            isLoading && { opacity: 0.5 },
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
    container: { flex: 1, backgroundColor: '#0A0A0A' },
    safeArea: { flex: 1 },
    backButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 12, gap: 6,
    },
    backText: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular' },
    content: { paddingHorizontal: 24, marginTop: 40 },
    title: { color: '#FFFFFF', fontSize: 32, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
    subtitle: { color: '#A5A2A2', fontSize: 16, fontFamily: 'Inter_400Regular', marginBottom: 48, lineHeight: 22 },
    phoneRow: { flexDirection: 'row', gap: 12 },
    countryCode: {
        backgroundColor: '#1A1817', borderRadius: 16, paddingHorizontal: 18, justifyContent: 'center',
        borderWidth: 1, borderColor: '#352520',
    },
    countryText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
    phoneInput: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A1817', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18,
        borderWidth: 1, borderColor: '#352520',
    },
    textInput: {
        flex: 1, color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold', padding: 0,
    },
    errorText: {
        color: '#EF5350', fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 12, marginLeft: 4,
    },
    bottomSection: {
        flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 40,
    },
    sendButton: { borderRadius: 30, overflow: 'hidden' },
    sendGradient: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 30,
    },
    sendText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
});
