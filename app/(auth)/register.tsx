import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { completeRegistration } = useAuthStore();

    const isValid = name.trim().length > 2 && dob.trim().length > 4; // basic validation

    const handleComplete = async () => {
        if (isValid) {
            setIsLoading(true);
            try {
                useAuthStore.setState({ customerName: name.trim(), dob: dob.trim() });
                await completeRegistration();
                router.replace('/(customer)/home');
            } catch {
                // error handled in store
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

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.content}>
                        <Text style={styles.title}>Complete Profile</Text>
                        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={18} color="#757575" />
                                <TextInput
                                    placeholder="John Doe"
                                    placeholderTextColor="#757575"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.textInput}
                                    autoFocus
                                />
                            </View>
                        </View>

                        {/* DOB Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar-outline" size={18} color="#757575" />
                                <TextInput
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#757575"
                                    value={dob}
                                    onChangeText={setDob}
                                    style={styles.textInput}
                                    keyboardType="numbers-and-punctuation"
                                />
                            </View>
                        </View>

                    </Animated.View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleComplete}
                        disabled={!isValid || isLoading}
                        style={({ pressed }) => [
                            styles.submitButton,
                            (!isValid || isLoading) && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            <Text style={styles.submitText}>
                                {isLoading ? 'Saving...' : 'Finish Setup'}
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
    scrollContent: { flexGrow: 1 },
    content: { paddingHorizontal: 24, marginTop: 24, flex: 1 },
    title: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
    subtitle: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 36, lineHeight: 22 },

    inputGroup: { marginBottom: 24 },
    label: { color: '#E0E0E0', fontSize: 14, fontFamily: 'Inter_500Medium', marginBottom: 10 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#1E1E1E', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18,
        borderWidth: 1, borderColor: '#353030',
    },
    textInput: {
        flex: 1, color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_600SemiBold', padding: 0,
    },

    bottomSection: {
        justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12
    },
    submitButton: { borderRadius: 14, overflow: 'hidden' },
    submitGradient: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 14,
    },
    submitText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
