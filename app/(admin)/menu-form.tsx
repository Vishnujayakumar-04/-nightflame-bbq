import { View, Text, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { AppStrings } from '../../constants/Strings';
import { AppColors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useMenuStore } from '../../store/menuStore';

export default function MenuFormScreen() {
    const router = useRouter();
    const { itemId } = useLocalSearchParams<{ itemId?: string }>();
    const isEditing = !!itemId;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [preparationTime, setPreparationTime] = useState('15');
    const [imageUrl, setImageUrl] = useState('');
    const [available, setAvailable] = useState(true);

    const [saving, setSaving] = useState(false);

    const { menuItems, addMenuItem, updateMenuItem } = useMenuStore();

    useEffect(() => {
        if (isEditing && itemId) {
            const item = menuItems.find(i => i.itemId === itemId);
            if (item) {
                setName(item.name);
                setDescription(item.description);
                setPrice(item.price.toString());
                setPreparationTime(item.preparationTime?.toString() || '15');
                setImageUrl(item.imageUrl);
                setAvailable(item.available);
            }
        }
    }, [isEditing, itemId, menuItems]);

    const handleSave = async () => {
        if (!name.trim() || !price.trim()) return;

        setSaving(true);
        try {
            const itemData = {
                name,
                description,
                price: parseFloat(price),
                preparationTime: parseInt(preparationTime, 10) || 15,
                imageUrl,
                available,
                category: 'Main' // default category for now
            };

            if (isEditing && itemId) {
                await updateMenuItem(itemId, itemData);
            } else {
                await addMenuItem(itemData);
            }
            router.back();
        } catch (error) {
            console.error("Failed to save menu item:", error);
        } finally {
            setSaving(false);
        }
    };

    const renderHeader = () => (
        <View className="flex-row items-center justify-between px-6 h-14 border-b border-divider/30 bg-background/80" style={{ zIndex: 10 }}>
            <View className="flex-row items-center">
                <Ionicons
                    name="chevron-back"
                    size={24}
                    color={AppColors.textPrimary}
                    onPress={() => router.back()}
                    className="p-2 -ml-2"
                />
            </View>
            <Text className="text-white font-[Outfit_600SemiBold] text-lg">
                {isEditing ? AppStrings.editItem : AppStrings.addItem}
            </Text>
            <View className="w-10" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {renderHeader()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6 pt-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="mb-8">
                        <Text className="text-white font-[Outfit_700Bold] text-2xl mb-2">
                            {isEditing ? 'Edit Menu Item' : 'Add New Item'}
                        </Text>
                        <Text className="text-textSecondary font-[Inter_400Regular] text-sm">
                            Fill in the details below
                        </Text>
                    </View>

                    <View className="mb-5">
                        <Input
                            label={AppStrings.itemName}
                            placeholder="e.g. Tandoori Chicken"
                            value={name}
                            onChangeText={setName}
                            icon={<Ionicons name="fast-food-outline" size={20} color={AppColors.textMuted} />}
                        />
                    </View>

                    <View className="mb-5">
                        <Input
                            label={AppStrings.itemDescription}
                            placeholder="Describe the item..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            icon={<Ionicons name="document-text-outline" size={20} color={AppColors.textMuted} className="mt-2" />}
                        />
                    </View>

                    <View className="mb-5">
                        <Input
                            label={AppStrings.itemPrice}
                            placeholder="199"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            icon={<Ionicons name="pricetag-outline" size={20} color={AppColors.textMuted} />}
                        />
                    </View>

                    <View className="mb-5">
                        <Input
                            label="Preparation Time (mins)"
                            placeholder="15"
                            value={preparationTime}
                            onChangeText={setPreparationTime}
                            keyboardType="numeric"
                            icon={<Ionicons name="time-outline" size={20} color={AppColors.textMuted} />}
                        />
                    </View>

                    <View className="mb-8">
                        <Input
                            label={AppStrings.imageUrl}
                            placeholder="https://..."
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            keyboardType="url"
                            autoCapitalize="none"
                            icon={<Ionicons name="image-outline" size={20} color={AppColors.textMuted} />}
                        />
                    </View>

                    {/* Availability Toggle */}
                    <View className="bg-surfaceCard p-4 rounded-2xl border border-divider flex-row items-center justify-between mb-8">
                        <View className="flex-row items-center">
                            <Ionicons
                                name={available ? "checkmark-circle" : "close-circle-outline"}
                                color={available ? AppColors.success : AppColors.error}
                                size={24}
                            />
                            <Text className="text-white font-[Outfit_600SemiBold] text-base ml-3">
                                {available ? AppStrings.available : AppStrings.unavailable}
                            </Text>
                        </View>
                        <Switch
                            value={available}
                            onValueChange={setAvailable}
                            trackColor={{ false: AppColors.surfaceLight, true: AppColors.success + '80' }}
                            thumbColor={available ? AppColors.success : AppColors.textMuted}
                        />
                    </View>

                    <Button
                        title={AppStrings.save}
                        onPress={handleSave}
                        loading={saving}
                        disabled={!name.trim() || !price.trim()}
                        icon={<Ionicons name="checkmark" size={20} color="white" />}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
