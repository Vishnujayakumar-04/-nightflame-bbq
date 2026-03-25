import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PaymentSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPayNow: () => void;
    onSelectPayLater: () => void;
    isShopOpen: boolean;
    isSubmitting: boolean;
}

export function PaymentSelectionModal({
    visible,
    onClose,
    onSelectPayNow,
    onSelectPayLater,
    isShopOpen,
    isSubmitting
}: PaymentSelectionModalProps) {

    // Pulsing glow animation for UPI card
    const glowOpacity = useSharedValue(0.5);

    useEffect(() => {
        if (visible) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                ),
                -1, true
            );
        }
    }, [visible]);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>

                    {/* Decorative handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
                        <View>
                            <Text style={styles.title}>How would you like to pay?</Text>
                            <Text style={styles.subtitle}>Choose your preferred payment method</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={20} color="#757575" />
                        </TouchableOpacity>
                    </Animated.View>

                    {!isShopOpen && (
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.closedWarning}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.closedWarningText}>Shop is currently closed. Order cannot be placed.</Text>
                        </Animated.View>
                    )}

                    {/* Payment Options */}
                    <View style={styles.optionsContainer}>

                        {/* Pay Now — UPI (Premium Card) */}
                        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={onSelectPayNow}
                                disabled={!isShopOpen || isSubmitting}
                                style={[styles.optionCard, (!isShopOpen || isSubmitting) && { opacity: 0.4 }]}
                            >
                                {/* Animated glow behind the card */}
                                <Animated.View style={[styles.upiGlow, glowStyle]} />

                                <LinearGradient
                                    colors={['#FF6A00', '#E53B0A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.upiGradient}
                                >
                                    <View style={styles.optionLeft}>
                                        <View style={styles.iconCircleUpi}>
                                            <Ionicons name="flash" size={22} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.optionTextGroup}>
                                            <Text style={styles.optionTitle}>Pay Now</Text>
                                            <Text style={styles.optionSubtitle}>Instant UPI Payment</Text>
                                        </View>
                                    </View>
                                    <View style={styles.recommendedBadge}>
                                        <Ionicons name="star" size={10} color="#FF6A00" />
                                        <Text style={styles.recommendedText}>FAST</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider with "or" */}
                        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </Animated.View>

                        {/* Pay at Pickup (Glass Card) */}
                        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={onSelectPayLater}
                                disabled={!isShopOpen || isSubmitting}
                                style={[styles.optionCard, (!isShopOpen || isSubmitting) && { opacity: 0.4 }]}
                            >
                                <View style={styles.pickupCard}>
                                    <View style={styles.optionLeft}>
                                        <View style={styles.iconCirclePickup}>
                                            <Ionicons name="wallet-outline" size={22} color="#FF6A00" />
                                        </View>
                                        <View style={styles.optionTextGroup}>
                                            <Text style={styles.optionTitleDark}>Pay at Pickup</Text>
                                            <Text style={styles.optionSubtitleDark}>Cash or UPI at counter</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#555" />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Security footer */}
                    <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.securityRow}>
                        <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                        <Text style={styles.securityText}>100% Secure & Encrypted Payments</Text>
                    </Animated.View>

                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#161414',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingBottom: 44,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2A2525',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#3A3535',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
    },
    subtitle: {
        color: '#757575',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        marginTop: 2,
    },
    closeBtn: {
        backgroundColor: '#252222',
        borderRadius: 20,
        padding: 6,
        marginTop: 2,
    },

    // Options
    optionsContainer: {
        gap: 0,
    },
    optionCard: {
        borderRadius: 18,
        overflow: 'hidden',
    },

    // UPI Card (Gradient)
    upiGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 22,
        backgroundColor: '#FF6A00',
        opacity: 0.15,
    },
    upiGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderRadius: 18,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconCircleUpi: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextGroup: {
        gap: 2,
    },
    optionTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
    },
    optionSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    recommendedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    recommendedText: {
        color: '#FF6A00',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 1,
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
        paddingHorizontal: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2A2525',
    },
    dividerText: {
        color: '#555',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        marginHorizontal: 14,
    },

    // Pickup Card (Glass)
    pickupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: '#1E1C1C',
        borderWidth: 1,
        borderColor: '#302A2A',
    },
    iconCirclePickup: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,106,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTitleDark: {
        color: '#E0E0E0',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
    },
    optionSubtitleDark: {
        color: '#757575',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },

    // Security
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
    },
    securityText: {
        color: '#555',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
    },

    // Warnings
    closedWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    closedWarningText: {
        color: '#EF4444',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
});
