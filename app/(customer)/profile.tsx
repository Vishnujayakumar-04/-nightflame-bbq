import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Image, Modal, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const SHOP_PHONE = '+919876543210';
const SHOP_EMAIL = 'nightflamebbq@example.com';

function ProfileScreen() {
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);
    const { user, signOut, updateProfile } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const userName = user?.name || 'Customer';
    const userPhone = user?.phoneNumber || '+91 9876543210';
    const profilePhoto = user?.profilePhotoUri;

    const handlePickImage = async (useCamera: boolean) => {
        setShowPhotoOptions(false);

        // Request permission
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
            setIsSaving(true);
            try {
                await updateProfile({ profilePhotoUri: result.assets[0].uri });
                Alert.alert('Success', 'Profile photo updated!');
            } catch {
                Alert.alert('Error', 'Failed to save photo.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleRemovePhoto = async () => {
        setShowPhotoOptions(false);
        setIsSaving(true);
        try {
            await updateProfile({ profilePhotoUri: undefined });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    await signOut();
                    clearCart();
                    router.replace('/(auth)/welcome');
                }
            }
        ]);
    };

    const menuItems = [
        {
            icon: 'receipt-outline' as const,
            label: 'My Orders',
            subtitle: 'View order history',
            onPress: () => router.push('/(customer)/orders'),
        },
        {
            icon: 'call-outline' as const,
            label: 'Contact Us',
            subtitle: 'Call or WhatsApp',
            onPress: () => {
                Alert.alert('Contact Us', 'Choose an option', [
                    { text: 'Call', onPress: () => Linking.openURL(`tel:${SHOP_PHONE}`) },
                    { text: 'WhatsApp', onPress: () => Linking.openURL(`https://wa.me/${SHOP_PHONE.replace('+', '')}`) },
                    { text: 'Cancel', style: 'cancel' },
                ]);
            },
        },
        {
            icon: 'chatbubble-ellipses-outline' as const,
            label: 'Support & Help',
            subtitle: 'FAQ and assistance',
            onPress: () => {
                Alert.alert('Support', 'For any queries, reach us at:\n\n📧 ' + SHOP_EMAIL + '\n📞 ' + SHOP_PHONE);
            },
        },
        {
            icon: 'information-circle-outline' as const,
            label: 'About NightFlame',
            subtitle: 'Our story & version info',
            onPress: () => {
                Alert.alert(
                    'About NightFlame BBQ',
                    'NightFlame BBQ brings you authentic wood-fired flavors. Grilled fresh, served hot!\n\nVersion: 1.0.0\n\n📍 Villianur Main Rd, Puducherry',
                    [{ text: 'OK' }]
                );
            },
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 32 }} />
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* User Card with Photo */}
                <View style={styles.userCard}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => setShowPhotoOptions(true)}
                        activeOpacity={0.8}
                    >
                        {profilePhoto ? (
                            <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={36} color="#757575" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={14} color="#FFFFFF" />
                        </View>
                        {isSaving && (
                            <View style={styles.savingOverlay}>
                                <Text style={styles.savingText}>Saving...</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userPhone}>{userPhone}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                index < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon} size={20} color="#FF6A00" />
                                </View>
                                <View>
                                    <Text style={styles.menuItemText}>{item.label}</Text>
                                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#757575" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <View style={styles.logoutIcon}>
                        <Ionicons name="log-out-outline" size={20} color="#EF5350" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Info */}
                <Text style={styles.appInfo}>NightFlame BBQ v1.0.0</Text>
            </ScrollView>

            {/* Photo Options Modal */}
            <Modal visible={showPhotoOptions} transparent animationType="slide" onRequestClose={() => setShowPhotoOptions(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowPhotoOptions(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Profile Photo</Text>
                        <TouchableOpacity style={styles.photoOption} onPress={() => handlePickImage(true)}>
                            <Ionicons name="camera-outline" size={22} color="#FF6A00" />
                            <Text style={styles.photoOptionText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoOption} onPress={() => handlePickImage(false)}>
                            <Ionicons name="images-outline" size={22} color="#FF6A00" />
                            <Text style={styles.photoOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                        {profilePhoto && (
                            <TouchableOpacity style={styles.photoOption} onPress={handleRemovePhoto}>
                                <Ionicons name="trash-outline" size={22} color="#EF5350" />
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1818' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 56,
    },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_600SemiBold' },
    userCard: {
        backgroundColor: '#252121', marginHorizontal: 20, borderRadius: 24,
        padding: 28, alignItems: 'center', marginBottom: 24,
        borderWidth: 1, borderColor: '#353030',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#1A1818',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: 'rgba(255, 106, 0, 0.3)',
    },
    avatarImage: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: 'rgba(255, 106, 0, 0.5)',
    },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#252121',
    },
    savingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 45,
        alignItems: 'center', justifyContent: 'center',
    },
    savingText: {
        color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_600SemiBold',
    },
    userName: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
    userPhone: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular' },
    menuCard: {
        backgroundColor: '#252121', marginHorizontal: 20, borderRadius: 20,
        overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#353030',
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(53, 48, 48, 0.5)' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    menuIcon: {
        width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255, 106, 0, 0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    menuItemText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    menuItemSubtitle: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, padding: 18, gap: 14,
    },
    logoutIcon: {
        width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(239, 83, 80, 0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoutText: { color: '#EF5350', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    appInfo: {
        color: '#555', fontSize: 12, fontFamily: 'Inter_400Regular',
        textAlign: 'center', marginTop: 20,
    },
    // Photo modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1818', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 20, paddingBottom: 40,
    },
    modalHandle: {
        width: 40, height: 4, backgroundColor: '#555', borderRadius: 2,
        alignSelf: 'center', marginBottom: 16,
    },
    modalTitle: {
        color: '#FFFFFF', fontSize: 20, fontFamily: 'Poppins_700Bold',
        textAlign: 'center', marginBottom: 20,
    },
    photoOption: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16, backgroundColor: '#252121', borderRadius: 14,
        marginBottom: 10, borderWidth: 1, borderColor: '#353030',
    },
    photoOptionText: {
        color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold',
    },
    cancelBtn: {
        padding: 16, alignItems: 'center', marginTop: 4,
    },
    cancelText: {
        color: '#757575', fontSize: 15, fontFamily: 'Inter_600SemiBold',
    },
});

export default ProfileScreen;
