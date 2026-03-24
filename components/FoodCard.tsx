import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../types/models';
import { AppColors } from '../constants/Colors';

interface FoodCardProps {
    item: MenuItem;
    quantity: number;
    onAdd: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
}

// Helper to format currency
const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

export const FoodCard = ({ item, quantity, onAdd, onIncrement, onDecrement }: FoodCardProps) => {
    return (
        <View className="bg-surfaceCard rounded-2xl border border-divider shadow-md shadow-black/40 overflow-hidden flex-1" style={{ elevation: 5, minHeight: 260 }}>
            {/* Image Section */}
            <View className="h-[130px] w-full relative">
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
                {!item.available && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center">
                        <Text className="text-error font-[Poppins_700Bold] tracking-widest">
                            SOLD OUT
                        </Text>
                    </View>
                )}
            </View>

            {/* Info Section */}
            <View className="p-3 flex-1 flex-col justify-between">
                <View>
                    <Text className="text-white font-[Outfit_600SemiBold] text-base mb-1" numberOfLines={1}>
                        {item.name}
                    </Text>

                    {item.preparationTime && (
                        <View className="flex-row items-center mb-1.5">
                            <Ionicons name="time-outline" size={12} color={AppColors.textMuted} />
                            <Text className="text-textMuted font-[Inter_500Medium] text-xs ml-1">
                                {item.preparationTime} mins prep
                            </Text>
                        </View>
                    )}

                    <Text className="text-textMuted font-[Inter_400Regular] text-xs" numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-primary font-[Outfit_800ExtraBold] text-lg tracking-tight">
                        {formatCurrency(item.price)}
                    </Text>

                    {item.available && (
                        quantity === 0 ? (
                            <TouchableOpacity
                                onPress={onAdd}
                                className="w-8 h-8 rounded-full bg-primary items-center justify-center"
                            >
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row items-center bg-surfaceLight rounded-full p-1">
                                <TouchableOpacity
                                    onPress={onDecrement}
                                    className="w-7 h-7 rounded-full bg-primary items-center justify-center"
                                >
                                    <Ionicons name="remove" size={16} color="white" />
                                </TouchableOpacity>

                                <Text className="text-white font-[Outfit_700Bold] px-2">
                                    {quantity}
                                </Text>

                                <TouchableOpacity
                                    onPress={onIncrement}
                                    className="w-7 h-7 rounded-full bg-primary items-center justify-center"
                                >
                                    <Ionicons name="add" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
            </View>
        </View>
    );
};
