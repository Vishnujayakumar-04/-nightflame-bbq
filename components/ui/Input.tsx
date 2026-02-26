import { View, Text, TextInput, TextInputProps } from 'react-native';
import { AppColors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className, ...props }: InputProps) => {
    return (
        <View className={`w-full mb-4 ${className || ''}`}>
            {label && (
                <Text className="text-textSecondary mb-2 font-[Inter_400Regular] text-sm">
                    {label}
                </Text>
            )}
            <View className={`flex-row items-center bg-surfaceLight rounded-xl px-4 h-14 border ${error ? 'border-error' : 'border-transparent'} focus:border-primary`}>
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className="flex-1 text-white font-[Inter_400Regular] text-base h-full"
                    placeholderTextColor={AppColors.textMuted}
                    {...props}
                />
            </View>
            {error && (
                <Text className="text-error font-[Inter_400Regular] text-xs mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
