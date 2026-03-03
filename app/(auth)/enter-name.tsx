import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, Pressable } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';



export default function EnterNameScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const { setName: storeSetName } = useAuthStore();

    const isValid = name.trim().length >= 2;

    const handleNext = () => {
        if (isValid) {
            storeSetName(name.trim());
            router.push('/(auth)/enter-address');
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
                    <Text style={styles.title}>What's your name?</Text>
                    <Text style={styles.subtitle}>We'll use this to personalise your experience</Text>

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#757575" />
                        <TextInput
                            placeholder="e.g. Vishnu"
                            placeholderTextColor="#757575"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoFocus
                            style={styles.textInput}
                        />
                    </View>
                </Animated.View>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleNext}
                        disabled={!isValid}
                        style={({ pressed }) => [
                            styles.nextButton,
                            !isValid && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextGradient}
                        >
                            <Text style={styles.nextText}>Next</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    subtitle: { color: '#A5A2A2', fontSize: 16, fontFamily: 'Inter_400Regular', marginBottom: 48 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A1817', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18,
        borderWidth: 1, borderColor: '#352520',
    },
    textInput: {
        flex: 1, color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold', padding: 0,
    },
    bottomSection: {
        flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 40,
    },
    nextButton: { borderRadius: 30, overflow: 'hidden' },
    nextGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 18, borderRadius: 30,
    },
    nextText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
});
