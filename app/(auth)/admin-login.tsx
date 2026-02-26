import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [obscure, setObscure] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const isValid = email.includes('@') && password.length >= 6;

    const handleLogin = () => {
        if (isValid) {
            setIsLoading(true);
            // TODO: Firebase Admin Login
            setTimeout(() => {
                setIsLoading(false);
                router.replace('/(admin)');
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

            <View className="flex-1 justify-center pb-20">

                {/* Admin Badge */}
                <View className="items-center mb-10">
                    <View className="flex-row items-center bg-primary/20 px-4 py-2 rounded-xl border border-primary/30">
                        <Ionicons name="shield-checkmark" size={20} color={AppColors.flameOrange} />
                        <Text className="text-primary font-[Poppins_700Bold] ml-2">
                            {AppStrings.adminLogin}
                        </Text>
                    </View>
                </View>

                <Text className="text-white text-3xl font-[Poppins_700Bold] mb-2 text-center">
                    Welcome Back
                </Text>
                <Text className="text-textSecondary text-sm font-[Inter_400Regular] mb-10 text-center">
                    Sign in to manage your shop
                </Text>

                <Input
                    placeholder={AppStrings.email}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon={<Ionicons name="mail-outline" size={20} color={AppColors.textSecondary} />}
                />

                <View className="relative">
                    <Input
                        placeholder={AppStrings.password}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={obscure}
                        icon={<Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} />}
                    />
                    <TouchableOpacity
                        onPress={() => setObscure(!obscure)}
                        className="absolute right-4 top-4"
                        style={{ zIndex: 10 }}
                    >
                        <Ionicons
                            name={obscure ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={AppColors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <View className="mt-8">
                    <Button
                        title={AppStrings.login}
                        disabled={!isValid}
                        loading={isLoading}
                        onPress={handleLogin}
                    />
                </View>

            </View>
        </SafeAreaView>
    );
}
