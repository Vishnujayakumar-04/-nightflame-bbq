import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { AppColors } from '../../constants/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button = ({ title, onPress, variant = 'primary', disabled = false, loading = false, icon }: ButtonProps) => {
    const getBgClass = () => {
        if (disabled) return 'bg-border';
        if (variant === 'secondary') return 'bg-surfaceLight';
        if (variant === 'outline') return 'bg-transparent border border-primary';
        return 'bg-primary'; // default primary flame color
    };

    const getTextColor = () => {
        if (disabled) return 'text-textSecondary';
        if (variant === 'outline') return 'text-primary';
        return 'text-white';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`w-full h-14 rounded-xl flex items-center justify-center flex-row ${getBgClass()}`}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? AppColors.flameOrange : '#fff'} />
            ) : (
                <View className="flex-row items-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={`font-semibold text-lg font-[Inter_600SemiBold] ${getTextColor()}`}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
