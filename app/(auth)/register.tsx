import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { completeRegistration } = useAuthStore();

    const isValid = name.trim().length > 2; // name is required, photo is optional

    const handlePickImage = async (useCamera: boolean) => {
        setShowPhotoOptions(false);

        if (useCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
                return;
            }
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Gallery access is needed to select a photo.');
                return;
            }
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

        if (!result.canceled && result.assets[0]) {
            setProfilePhoto(result.assets[0].uri);
        }
    };

    const handleComplete = async () => {
        if (isValid) {
            setIsLoading(true);
            try {
                useAuthStore.setState({ 
                    customerName: name.trim(), 
                    profilePhotoUri: profilePhoto || undefined,
                    dob: undefined 
                });
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

                        {/* Profile Photo Selector */}
                        <View style={styles.photoSection}>
                            <TouchableOpacity
                                style={styles.avatarContainer}
                                onPress={() => setShowPhotoOptions(true)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.avatarGlow}>
                                    {profilePhoto ? (
                                        <Image source={{ uri: profilePhoto }} style={styles.avatarImage} contentFit="cover" cachePolicy="memory-disk" />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="camera" size={32} color="#FF6A00" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.cameraBtn}>
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.photoInstruction}>Add a profile photo (optional)</Text>
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

                {/* Photo Options Modal */}
                <Modal visible={showPhotoOptions} transparent animationType="slide" onRequestClose={() => setShowPhotoOptions(false)}>
                    <Pressable style={styles.modalOverlay} onPress={() => setShowPhotoOptions(false)}>
                        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>Profile Photo</Text>
                            <TouchableOpacity style={styles.photoOption} onPress={() => handlePickImage(true)}>
                                <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(255,106,0,0.1)' }]}>
                                    <Ionicons name="camera-outline" size={22} color="#FF6A00" />
                                </View>
                                <Text style={styles.photoOptionText}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoOption} onPress={() => handlePickImage(false)}>
                                <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(33,150,243,0.1)' }]}>
                                    <Ionicons name="images-outline" size={22} color="#2196F3" />
                                </View>
                                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
                            </TouchableOpacity>
                            {profilePhoto && (
                                <TouchableOpacity style={styles.photoOption} onPress={() => { setProfilePhoto(null); setShowPhotoOptions(false); }}>
                                    <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(239,83,80,0.1)' }]}>
                                        <Ionicons name="trash-outline" size={22} color="#EF5350" />
                                    </View>
                                    <Text style={[styles.photoOptionText, { color: '#EF5350' }]}>Remove Photo</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPhotoOptions(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>
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

    // Photo
    photoSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    avatarContainer: { position: 'relative' },
    avatarGlow: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 2, borderColor: 'rgba(255,106,0,0.4)',
        padding: 3, backgroundColor: 'rgba(255,106,0,0.05)',
    },
    avatarPlaceholder: {
        flex: 1, borderRadius: 50, backgroundColor: 'rgba(255,106,0,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarImage: { flex: 1, borderRadius: 50 },
    cameraBtn: {
        position: 'absolute', bottom: 0, right: 0,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: '#0D0D0D',
    },
    photoInstruction: { color: '#757575', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 12 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, backgroundColor: '#555', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    modalTitle: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: 20 },
    photoOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#252121', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#353030' },
    photoOptionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    photoOptionText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    cancelBtn: { padding: 16, alignItems: 'center', marginTop: 4 },
    cancelText: { color: '#757575', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
