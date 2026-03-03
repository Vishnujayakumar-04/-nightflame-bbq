import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button = ({ title, onPress, variant = 'primary', disabled = false, loading = false, icon }: ButtonProps) => {

    // Core structure properties based on variants
    const isPrimary = variant === 'primary' && !disabled;
    const heightClass = variant === 'secondary' ? 'h-[48px]' : 'h-[52px]';

    // Non-gradient background styles
    const getBgClass = () => {
        if (disabled) return 'bg-[#2A2A2A]'; // dark disabled state
        if (variant === 'secondary') return 'bg-[#1E1E1E] border border-[#2A2A2A]';
        if (variant === 'destructive') return 'bg-[#EF4444]';
        if (variant === 'outline') return 'bg-transparent border border-[#FF6A00]';
        return ''; // Primary uses gradient, handled below
    };

    const getTextColor = () => {
        if (disabled) return 'text-[#A1A1AA]'; // text secondary
        if (variant === 'outline') return 'text-[#FF6A00]';
        return 'text-[#FFFFFF]'; // bold white text
    };

    const InnerContent = () => (
        <View className="flex-row items-center justify-center">
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#FF6A00' : '#fff'} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={`text-[16px] font-[Inter_700Bold] ${getTextColor()}`}>
                        {title}
                    </Text>
                </>
            )}
        </View>
    );

    const baseClasses = `w-full rounded-[16px] flex items-center justify-center flex-row ${heightClass} ${getBgClass()}`;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={baseClasses}
        >
            {isPrimary ? (
                <LinearGradient
                    colors={['#FF6A00', '#FF2E00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, width: '100%', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                    <InnerContent />
                </LinearGradient>
            ) : (
                <InnerContent />
            )}
        </TouchableOpacity>
    );
};
