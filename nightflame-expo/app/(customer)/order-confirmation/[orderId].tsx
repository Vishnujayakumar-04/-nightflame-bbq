import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppStrings } from '../../../constants/Strings';
import { AppColors } from '../../../constants/Colors';
import { Button } from '../../../components/ui/Button';

const formatOrderIdShort = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    // Ensure we have an ID for safe rendering
    const displayId = orderId || 'UNKNOWN';

    return (
        <SafeAreaView className="flex-1 bg-background px-6" edges={['top', 'bottom']}>
            <View className="flex-1 justify-center items-center">

                {/* Success Icon */}
                <View className="w-24 h-24 rounded-full bg-success/10 border-2 border-success/30 items-center justify-center mb-8">
                    <Ionicons name="checkmark" size={48} color={AppColors.success} />
                </View>

                <Text className="text-white text-3xl font-[Outfit_800ExtraBold] mb-2 text-center">
                    {AppStrings.orderConfirmed}
                </Text>

                <Text className="text-textMuted text-sm font-[Inter_400Regular] mb-8 text-center px-4">
                    Your order has been placed successfully
                </Text>

                {/* Order ID Card */}
                <View className="bg-surfaceCard px-8 py-5 rounded-2xl border border-divider w-full items-center mb-16">
                    <Text className="text-textMuted text-xs font-[Inter_500Medium] tracking-widest mb-1">
                        {AppStrings.orderId.toUpperCase()}
                    </Text>
                    <Text className="text-primary text-2xl font-[Outfit_700Bold] tracking-widest">
                        {formatOrderIdShort(displayId)}
                    </Text>
                </View>

                {/* Actions */}
                <View className="w-full gap-y-4 pt-10">
                    <Button
                        title={AppStrings.trackOrder}
                        icon={<Ionicons name="bus-outline" size={20} color="white" />}
                        onPress={() => router.replace(`/(customer)/order-tracking/${displayId}`)}
                    />
                    <Button
                        title={AppStrings.backToMenu}
                        variant="outline"
                        onPress={() => router.replace('/(customer)/home')}
                    />
                </View>

            </View>
        </SafeAreaView>
    );
}
