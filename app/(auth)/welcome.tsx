import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { AppStrings } from '../../constants/Strings';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <View className="flex-1 justify-center items-center px-6">

                {/* Placeholder for Logo */}
                <View className="mb-12 items-center justify-center">
                    {/* Note: The actual image will be added later when assets are moved over */}
                    <View className="w-48 h-48 bg-surface rounded-full items-center justify-center border-2 border-primary">
                        <Text className="text-secondary text-5xl font-bold text-primary">NFB</Text>
                    </View>
                </View>

                <Text className="text-white text-4xl font-[Poppins_700Bold] text-center mb-4">
                    {AppStrings.appName}
                </Text>

                <Text className="text-textSecondary text-lg font-[Inter_400Regular] text-center mb-16">
                    {AppStrings.tagline}
                </Text>

                <View className="w-full mt-auto mb-8 gap-y-4">
                    <Button
                        title={AppStrings.getStarted}
                        onPress={() => router.push('/(auth)/enter-name')}
                    />
                    <Button
                        title={AppStrings.adminLogin}
                        variant="outline"
                        onPress={() => router.push('/(auth)/admin-login')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
