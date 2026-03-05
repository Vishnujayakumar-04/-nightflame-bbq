import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function UploadProfileScreen() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const { setProfilePhoto, completeRegistration, isLoading } = useAuthStore();

    const pickImage = async (useCamera: boolean) => {
        const permission = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permission.status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your camera/gallery to set a profile photo.');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
            : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImage(uri);
            setProfilePhoto(uri);
        }
    };

    const handleFinish = async () => {
        try {
            await completeRegistration();
            router.replace('/(auth)/notification-permission');
        } catch {
            Alert.alert('Error', 'Failed to complete registration. Please try again.');
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
                    <Text style={styles.title}>Almost there!</Text>
                    <Text style={styles.subtitle}>Add a profile photo so we can recognize you</Text>

                    {/* Photo Placeholder/Preview */}
                    <View style={styles.photoContainer}>
                        <Pressable onPress={() => pickImage(false)} style={styles.photoCircle}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderIcon}>
                                    <Ionicons name="camera-outline" size={40} color="#757575" />
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </View>
                            )}
                        </Pressable>

                        <View style={styles.optionsRow}>
                            <Pressable onPress={() => pickImage(true)} style={styles.optionBtn}>
                                <Ionicons name="camera" size={20} color="#FF6A00" />
                                <Text style={styles.optionText}>Camera</Text>
                            </Pressable>
                            <Pressable onPress={() => pickImage(false)} style={styles.optionBtn}>
                                <Ionicons name="images" size={20} color="#FF6A00" />
                                <Text style={styles.optionText}>Gallery</Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>

                {/* Bottom Button */}
                <View style={styles.bottomSection}>
                    <Pressable
                        onPress={handleFinish}
                        disabled={isLoading}
                        style={({ pressed }) => [
                            styles.submitButton,
                            isLoading && { opacity: 0.5 },
                            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitText}>{image ? 'SUBMIT & FINISH' : 'SKIP & FINISH'}</Text>
                            )}
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
    content: { paddingHorizontal: 24, marginTop: 40, alignItems: 'center' },
    title: { color: '#FFFFFF', fontSize: 32, fontFamily: 'Poppins_700Bold', marginBottom: 8, textAlign: 'center' },
    subtitle: { color: '#A5A2A2', fontSize: 16, fontFamily: 'Inter_400Regular', marginBottom: 60, textAlign: 'center', lineHeight: 22 },

    photoContainer: { alignItems: 'center', width: '100%' },
    photoCircle: {
        width: 160, height: 160, borderRadius: 80, backgroundColor: '#1A1817',
        borderWidth: 2, borderColor: '#352520', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    },
    profileImage: { width: '100%', height: '100%' },
    placeholderIcon: { alignItems: 'center' },
    addPhotoText: { color: '#757575', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 8 },

    optionsRow: { flexDirection: 'row', gap: 16, marginTop: 32 },
    optionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
        backgroundColor: '#1A1817', borderWidth: 1, borderColor: '#352520',
    },
    optionText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },

    bottomSection: {
        flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 40,
    },
    submitButton: { borderRadius: 30, overflow: 'hidden', width: '100%' },
    submitGradient: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 30,
    },
    submitText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
});
