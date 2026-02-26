import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function EnterNameScreen() {
    const router = useRouter();
    const [name, setName] = useState('');

    const isValid = name.trim().length >= 2;

    const handleNext = () => {
        if (isValid) {
            // TODO: Save name to Zustand
            router.push('/(auth)/login');
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
                    {AppStrings.whatName}
                </Text>
                <Text className="text-textSecondary text-sm font-[Inter_400Regular] mb-10">
                    {AppStrings.nameSubtitle}
                </Text>

                <Input
                    placeholder={AppStrings.nameHint}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    icon={<Ionicons name="person-outline" size={20} color={AppColors.textSecondary} />}
                />

                <View className="flex-1 justify-end mb-8">
                    <View style={{ opacity: isValid ? 1 : 0.5 }}>
                        <Button
                            title={AppStrings.next}
                            disabled={!isValid}
                            onPress={handleNext}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
