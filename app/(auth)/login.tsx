import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerLoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isValid = phone.trim().length === 10;

    const handleSendOtp = () => {
        if (isValid) {
            setIsLoading(true);
            // TODO: Firebase Send OTP
            setTimeout(() => {
                setIsLoading(false);
                router.push('/(auth)/otp');
            }, 1000);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background px-6" edges={['top', 'bottom']}>
            {/* Back Button */}
            <View className="h-14 justify-center">
                <Ionicons
                    name="chevron-back"
                    size={24}
                    color="white"
                    onPress={() => router.back()}
                />
            </View>

            <View className="flex-1 mt-6">
                <Text className="text-white text-3xl font-[Poppins_700Bold] mb-2">
                    {AppStrings.enterPhone}
                </Text>
                <Text className="text-textSecondary text-sm font-[Inter_400Regular] mb-10">
                    We'll send you a verification code
                </Text>

                <View className="flex-row items-center w-full">
                    <View className="h-14 w-16 bg-surfaceLight rounded-xl mr-3 items-center justify-center border border-transparent">
                        <Text className="text-primary font-[Poppins_700Bold]">+91</Text>
                    </View>
                    <View className="flex-1">
                        <Input
                            placeholder="9876543210"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            icon={<Ionicons name="call-outline" size={20} color={AppColors.textSecondary} />}
                        />
                    </View>
                </View>

                <View className="flex-1 justify-end mb-8">
                    <View style={{ opacity: isValid ? 1 : 0.5 }}>
                        <Button
                            title={AppStrings.sendOtp}
                            disabled={!isValid}
                            loading={isLoading}
                            onPress={handleSendOtp}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
