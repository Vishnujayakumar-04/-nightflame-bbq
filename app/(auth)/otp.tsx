import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isValid = otp.length === 6;

    const handleVerify = () => {
        if (isValid) {
            setIsLoading(true);
            // TODO: Firebase Verify OTP
            setTimeout(() => {
                setIsLoading(false);
                router.replace('/(customer)');
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
                    {AppStrings.verifyOtp}
                </Text>
                <Text className="text-textSecondary text-sm font-[Inter_400Regular] mb-10">
                    {AppStrings.enterOtp}
                </Text>

                <View className="items-center mb-8">
                    <TextInput
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="------"
                        placeholderTextColor={AppColors.textMuted}
                        className="text-white text-4xl font-[Poppins_700Bold] tracking-[10px] text-center w-full"
                        autoFocus
                    />
                </View>

                <TouchableOpacity className="items-center mb-10">
                    <Text className="text-primary font-[Inter_600SemiBold]">
                        {AppStrings.resendOtp}
                    </Text>
                </TouchableOpacity>

                <View className="flex-1 justify-end mb-8">
                    <View style={{ opacity: isValid ? 1 : 0.5 }}>
                        <Button
                            title="Verify"
                            disabled={!isValid}
                            loading={isLoading}
                            onPress={handleVerify}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
