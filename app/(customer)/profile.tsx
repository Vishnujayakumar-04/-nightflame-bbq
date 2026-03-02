import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function ProfileScreen() {
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);
    const { user, signOut } = useAuthStore();

    const userName = user?.name || 'Customer';
    const userPhone = user?.phoneNumber || '+91 9876543210';

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
        { icon: 'receipt-outline' as const, label: 'My Orders', onPress: () => router.push('/(customer)/orders') },
        { icon: 'location-outline' as const, label: 'Saved Addresses', onPress: () => { } },
        { icon: 'chatbubble-ellipses-outline' as const, label: 'Support & Help', onPress: () => { } },
        { icon: 'information-circle-outline' as const, label: 'About NightFlame', onPress: () => { } },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={36} color="#757575" />
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userPhone}>{userPhone}</Text>
                    <TouchableOpacity style={styles.editProfileBtn}>
                        <Ionicons name="create-outline" size={16} color="#FF6A00" />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
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
                                    <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                                </View>
                                <Text style={styles.menuItemText}>{item.label}</Text>
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
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1818',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        borderWidth: 2, borderColor: 'rgba(255, 106, 0, 0.3)',
    },
    userName: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
    userPhone: { color: '#A5A2A2', fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 14 },
    editProfileBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
        backgroundColor: 'rgba(255, 106, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 106, 0, 0.2)',
    },
    editProfileText: { color: '#FF6A00', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    menuCard: {
        backgroundColor: '#252121', marginHorizontal: 20, borderRadius: 20,
        overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#353030',
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 18,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(53, 48, 48, 0.5)' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    menuIcon: {
        width: 38, height: 38, borderRadius: 12, backgroundColor: '#1A1818',
        alignItems: 'center', justifyContent: 'center',
    },
    menuItemText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
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
});
