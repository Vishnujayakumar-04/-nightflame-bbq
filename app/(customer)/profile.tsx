import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Image, Modal, Pressable, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';



const SHOP_PHONE = '+919876543210';
const SHOP_EMAIL = 'barqueegrillstation@example.com';

function ProfileScreen() {
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);
    const { user, signOut, updateProfile } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const userName = user?.name || 'Customer';
    const userPhone = user?.phoneNumber || '+91 9876543210';
    const profilePhoto = user?.profilePhotoUri;

    // Order stats
    const stats = { total: 0, active: 0, completed: 0 };

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

    const settingsItems = [

        {
            icon: 'call-outline' as const,
            label: 'Contact Us',
            subtitle: 'Call or WhatsApp us',
            onPress: () => {
                Alert.alert('Contact Us', 'Choose an option', [
                    { text: 'Call', onPress: () => Linking.openURL(`tel:${SHOP_PHONE}`) },
                    { text: 'WhatsApp', onPress: () => Linking.openURL(`https://wa.me/${SHOP_PHONE.replace('+', '')}`) },
                    { text: 'Cancel', style: 'cancel' },
                ]);
            },
            color: '#4CAF50',
        },
    ];

    return (
        <LinearGradient colors={['#1A1818', '#1D1510']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Premium Profile Header */}
                    <Animated.View entering={FadeInDown.duration(500)}>
                        <LinearGradient
                            colors={['rgba(255,106,0,0.15)', 'rgba(255,106,0,0.02)', 'transparent']}
                            style={styles.headerGradient}
                        >
                            <View style={styles.headerRow}>
                                <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
                                    <Ionicons name="menu" size={26} color="#FFFFFF" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Profile</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            {/* Avatar */}
                            <TouchableOpacity
                                style={styles.avatarContainer}
                                onPress={() => setShowPhotoOptions(true)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.avatarGlow}>
                                    {profilePhoto ? (
                                        <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="person" size={44} color="#FF6A00" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.cameraBtn}>
                                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                                </View>
                                {isSaving && (
                                    <View style={styles.savingOverlay}>
                                        <Text style={styles.savingText}>Saving...</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Name & Phone */}
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.userPhone}>{userPhone}</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Order Stats */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#FF6A00' }]}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total Orders</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardMiddle]}>
                            <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.active}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                    </Animated.View>

                    {/* Settings Section */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <Text style={styles.sectionTitle}>SETTINGS</Text>
                        <View style={styles.settingsCard}>
                            {settingsItems.map((item, index) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.settingsItem,
                                        index < settingsItems.length - 1 && styles.settingsItemBorder,
                                    ]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.settingsItemLeft}>
                                        <View style={[styles.settingsIcon, { backgroundColor: `${item.color}15` }]}>
                                            <Ionicons name={item.icon} size={20} color={item.color} />
                                        </View>
                                        <View>
                                            <Text style={styles.settingsLabel}>{item.label}</Text>
                                            <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#555" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>



                    {/* Footer */}
                    <View style={styles.footer}>

                        <Text style={styles.footerText}>Barquee grill station</Text>
                        <Text style={styles.footerVersion}>Version 1.0.0</Text>
                    </View>

                </ScrollView>

                {/* Side Drawer */}
                <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                    <View style={styles.drawerOverlay}>
                        <Pressable style={styles.drawerBackdrop} onPress={() => setShowMenu(false)} />
                        <View style={styles.drawerContainer}>
                            {/* Drawer Header - User Info */}
                            <View style={styles.drawerHeader}>
                                <View style={styles.drawerAvatarRing}>
                                    {profilePhoto ? (
                                        <Image source={{ uri: profilePhoto }} style={styles.drawerAvatar} />
                                    ) : (
                                        <View style={styles.drawerAvatarPlaceholder}>
                                            <Ionicons name="person" size={30} color="#FF6A00" />
                                        </View>
                                    )}
                                </View>
                                <View style={{ marginLeft: 14, flex: 1 }}>
                                    <Text style={styles.drawerUserName}>{userName}</Text>
                                    <Text style={styles.drawerUserPhone}>{userPhone}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.drawerCloseBtn}>
                                    <Ionicons name="close" size={22} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            {/* Drawer Nav Items */}
                            <View style={styles.drawerNav}>

                                <TouchableOpacity style={styles.drawerNavItem} onPress={() => { setShowMenu(false); Alert.alert('Contact Us', 'Choose an option', [{ text: 'Call', onPress: () => Linking.openURL(`tel:${SHOP_PHONE}`) }, { text: 'WhatsApp', onPress: () => Linking.openURL(`https://wa.me/${SHOP_PHONE.replace('+', '')}`) }, { text: 'Cancel', style: 'cancel' }]); }}>
                                    <Ionicons name="call-outline" size={22} color="#FF6A00" />
                                    <Text style={styles.drawerNavText}>Contact Us</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.drawerNavItem} onPress={() => { setShowMenu(false); Alert.alert('Support', 'For any queries, reach us at:\n\n📧 ' + SHOP_EMAIL + '\n📞 ' + SHOP_PHONE); }}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FF6A00" />
                                    <Text style={styles.drawerNavText}>Support & Help</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.drawerNavItem} onPress={() => { setShowMenu(false); Alert.alert('About Barquee grill station', 'Barquee grill station brings you authentic wood-fired flavors.\n\nVersion: 1.0.0\n\n📍 Villianur Main Rd, Puducherry'); }}>
                                    <Ionicons name="information-circle-outline" size={22} color="#FF6A00" />
                                    <Text style={styles.drawerNavText}>About Barquee grill</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sign Out at Bottom */}
                            <View style={styles.drawerFooter}>
                                <View style={styles.drawerDivider} />
                                <View style={styles.logoutWrapper}>
                                    <TouchableOpacity style={styles.drawerNavItem} onPress={() => { setShowMenu(false); handleLogout(); }}>
                                        <Ionicons name="log-out-outline" size={22} color="#EF5350" />
                                        <Text style={[styles.drawerNavText, { color: '#EF5350' }]}>Sign Out</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

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
                                <TouchableOpacity style={styles.photoOption} onPress={handleRemovePhoto}>
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    headerGradient: {
        paddingTop: 16, paddingBottom: 28,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF', fontSize: 20, fontFamily: 'Poppins_700Bold',
        fontStyle: 'italic', marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', paddingHorizontal: 20, marginBottom: 8,
    },
    menuBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Avatar
    avatarContainer: { position: 'relative', marginBottom: 18 },
    avatarGlow: {
        width: 110, height: 110, borderRadius: 55,
        borderWidth: 3, borderColor: 'rgba(255,106,0,0.4)',
        padding: 3,
        shadowColor: '#FF6A00', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
    },
    avatarPlaceholder: {
        width: '100%', height: '100%', borderRadius: 55,
        backgroundColor: 'rgba(255,106,0,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarImage: {
        width: '100%', height: '100%', borderRadius: 55,
    },
    cameraBtn: {
        position: 'absolute', bottom: 2, right: 2,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: '#1A1818',
    },
    savingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 55,
        alignItems: 'center', justifyContent: 'center',
    },
    savingText: { color: '#FFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' },

    // Name
    userName: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
    userPhone: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_400Regular' },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20, marginTop: 4, marginBottom: 28,
        backgroundColor: '#252121', borderRadius: 16,
        borderWidth: 1, borderColor: '#353030',
        overflow: 'hidden',
    },
    statCard: {
        flex: 1, alignItems: 'center', paddingVertical: 18,
    },
    statCardMiddle: {
        borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#353030',
    },
    statNumber: { fontSize: 22, fontFamily: 'Poppins_700Bold', marginBottom: 2 },
    statLabel: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular' },

    // Settings Section
    sectionTitle: {
        color: '#757575', fontSize: 12, fontFamily: 'Inter_600SemiBold',
        letterSpacing: 1.2, marginHorizontal: 20, marginBottom: 10,
    },
    settingsCard: {
        backgroundColor: '#252121', marginHorizontal: 20, borderRadius: 18,
        overflow: 'hidden', borderWidth: 1, borderColor: '#353030',
        marginBottom: 20,
    },
    settingsItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 15,
    },
    settingsItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(53,48,48,0.5)' },
    settingsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    settingsIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    settingsLabel: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
    settingsSubtitle: { color: '#757575', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 15,
        backgroundColor: 'rgba(239,83,80,0.06)',
        borderRadius: 18, borderWidth: 1, borderColor: 'rgba(239,83,80,0.15)',
        gap: 14,
    },
    logoutIcon: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(239,83,80,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    logoutText: { color: '#EF5350', fontSize: 15, fontFamily: 'Inter_600SemiBold' },

    // Footer
    footer: {
        alignItems: 'center', marginTop: 16,
    },
    footerEmoji: { fontSize: 28, marginBottom: 8 },
    footerText: { color: '#555', fontSize: 14, fontFamily: 'Poppins_700Bold', fontStyle: 'italic' },
    footerVersion: { color: '#3A3A3A', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },

    // Photo modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E1E', borderTopLeftRadius: 28, borderTopRightRadius: 28,
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
    photoOptionIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
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

    // Side Drawer
    drawerOverlay: {
        flex: 1, flexDirection: 'row',
    },
    drawerBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    drawerContainer: {
        width: Dimensions.get('window').width * 0.75,
        height: '100%',
        backgroundColor: '#1A1818',
        paddingTop: 50,
        borderRightWidth: 1, borderRightColor: '#353030',
    },
    drawerHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 28,
        borderBottomWidth: 1, borderBottomColor: '#353030',
    },
    drawerAvatarRing: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: 'rgba(255,106,0,0.4)',
        padding: 2,
    },
    drawerAvatar: {
        width: '100%', height: '100%', borderRadius: 28,
    },
    drawerAvatarPlaceholder: {
        width: '100%', height: '100%', borderRadius: 28,
        backgroundColor: 'rgba(255,106,0,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    drawerUserName: {
        color: '#FFFFFF', fontSize: 17, fontFamily: 'Poppins_700Bold',
    },
    drawerUserPhone: {
        color: '#757575', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2,
    },
    drawerCloseBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    drawerNav: {
        flex: 1, paddingTop: 20,
    },
    drawerNavItem: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 24, paddingVertical: 16,
    },
    drawerNavText: {
        color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_500Medium',
    },
    drawerFooter: {
        paddingBottom: 80,
    },
    logoutWrapper: {
        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: 'rgba(239, 83, 80, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 83, 80, 0.2)',
    },
    drawerDivider: {
        height: 1, backgroundColor: '#353030', marginHorizontal: 20, marginVertical: 8,
    },
});

export default ProfileScreen;
