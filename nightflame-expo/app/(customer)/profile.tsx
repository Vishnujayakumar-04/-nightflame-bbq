import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { useCartStore } from '../../store/cartStore';

export default function ProfileScreen() {
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);

    // In a real app, user data comes from Firebase Auth and Firestore
    const user = {
        name: 'John Doe',
        phone: '+91 9876543210',
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        clearCart();
                        // TODO: Sign out from Firebase
                        router.replace('/(auth)/welcome');
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-white font-[Outfit_700Bold] text-2xl">
                {AppStrings.profile}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}

            <ScrollView className="flex-1 px-6 pt-4">

                {/* User Info Card */}
                <View className="bg-surfaceCard p-6 rounded-3xl border border-divider mb-8 items-center">
                    <View className="w-24 h-24 bg-surfaceLight rounded-full items-center justify-center mb-4 border-2 border-primary/30">
                        <Ionicons name="person" size={40} color={AppColors.textSecondary} />
                    </View>
                    <Text className="text-white font-[Outfit_700Bold] text-2xl mb-1">
                        {user.name}
                    </Text>
                    <Text className="text-textSecondary font-[Inter_400Regular] text-base">
                        {user.phone}
                    </Text>
                </View>

                {/* Menu Sections */}
                <View className="bg-surfaceCard rounded-3xl border border-divider overflow-hidden mb-6">

                    <TouchableOpacity
                        onPress={() => router.push('/(customer)/orders')}
                        className="flex-row items-center justify-between p-5 border-b border-divider/50"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-surfaceLight rounded-full items-center justify-center mr-4">
                                <Ionicons name="receipt-outline" size={20} color={AppColors.textPrimary} />
                            </View>
                            <Text className="text-white font-[Outfit_500Medium] text-base">
                                {AppStrings.myOrders}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { }}
                        className="flex-row items-center justify-between p-5 border-b border-divider/50"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-surfaceLight rounded-full items-center justify-center mr-4">
                                <Ionicons name="location-outline" size={20} color={AppColors.textPrimary} />
                            </View>
                            <Text className="text-white font-[Outfit_500Medium] text-base">
                                Saved Addresses
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { }}
                        className="flex-row items-center justify-between p-5"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-surfaceLight rounded-full items-center justify-center mr-4">
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={AppColors.textPrimary} />
                            </View>
                            <Text className="text-white font-[Outfit_500Medium] text-base">
                                Support
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
                    </TouchableOpacity>

                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center p-5 mb-10"
                >
                    <View className="w-10 h-10 bg-error/10 rounded-full items-center justify-center mr-4">
                        <Ionicons name="log-out-outline" size={20} color={AppColors.error} />
                    </View>
                    <Text className="text-error font-[Outfit_600SemiBold] text-base">
                        {AppStrings.logout}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
