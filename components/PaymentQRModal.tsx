import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { openUpiPayment } from '../utils/upiPayment';

interface PaymentQRModalProps {
    visible: boolean;
    amount: number;
    orderId?: string;
    isLoading: boolean;
    onClose: () => void;
    onPaid: () => void;
}

export function PaymentQRModal({ visible, amount, orderId, isLoading, onClose, onPaid }: PaymentQRModalProps) {
    const [isOpeningUpi, setIsOpeningUpi] = useState(false);
    const [hasOpenedUpi, setHasOpenedUpi] = useState(false);

    // Pulsing animation for the confirm button
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible && hasOpenedUpi) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.03, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                ),
                -1, true
            );
        }
    }, [visible, hasOpenedUpi]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setHasOpenedUpi(false);
        }
    }, [visible]);

    const handlePayViaApp = async () => {
        setIsOpeningUpi(true);
        try {
            await openUpiPayment(amount, orderId || 'ORDER');
            setHasOpenedUpi(true);
        } catch {
            // UPI app may not be installed
        } finally {
            setIsOpeningUpi(false);
        }
    };

    const handleConfirmPayment = () => {
        try {
            onPaid();
        } catch (e) {
            console.error('Payment confirmation error:', e);
            Alert.alert('Error', 'Failed to confirm payment. Please try again.');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>

                    {/* Header */}
                    <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
                        <View>
                            <Text style={styles.title}>Complete Payment</Text>
                            <Text style={styles.subtitle}>Pay securely via UPI</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#757575" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Amount Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <LinearGradient
                            colors={['rgba(255,106,0,0.12)', 'rgba(229,59,10,0.06)']}
                            style={styles.amountCard}
                        >
                            <Text style={styles.amountLabel}>Total Amount</Text>
                            <Text style={styles.amountValue}>₹{amount.toFixed(0)}</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Step 1: Pay via UPI App */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <TouchableOpacity
                            style={[styles.upiCard, hasOpenedUpi && styles.upiCardDone]}
                            onPress={handlePayViaApp}
                            activeOpacity={0.85}
                            disabled={isOpeningUpi}
                        >
                            <LinearGradient
                                colors={hasOpenedUpi ? ['#1B3A1B', '#1A2E1A'] : ['#FF6A00', '#E53B0A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.upiGradient}
                            >
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>{hasOpenedUpi ? '✓' : '1'}</Text>
                                </View>

                                {isOpeningUpi ? (
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                        <Text style={styles.upiSubtext}>Opening UPI app...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.upiTitle}>
                                                {hasOpenedUpi ? 'UPI App Opened' : 'Pay via UPI App'}
                                            </Text>
                                            <Text style={styles.upiSubtext}>
                                                {hasOpenedUpi ? 'Complete payment in your UPI app' : 'GPay, PhonePe, Paytm, etc.'}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={hasOpenedUpi ? 'checkmark-circle' : 'chevron-forward'}
                                            size={22}
                                            color={hasOpenedUpi ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
                                        />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Divider */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>then</Text>
                        <View style={styles.dividerLine} />
                    </Animated.View>

                    {/* Step 2: I Have Paid — Premium Button */}
                    <Animated.View entering={FadeInDown.delay(400).duration(500)} style={pulseStyle}>
                        <TouchableOpacity
                            onPress={handleConfirmPayment}
                            activeOpacity={0.85}
                            disabled={isLoading}
                            style={styles.confirmCard}
                        >
                            <LinearGradient
                                colors={['#1E3A1E', '#143214']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.confirmGradient}
                            >
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>2</Text>
                                </View>
                                
                                {isLoading ? (
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <ActivityIndicator color="#4CAF50" size="small" />
                                        <Text style={[styles.confirmSubtext, { marginTop: 4 }]}>Placing your order...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.confirmTitle}>I Have Paid ₹{amount.toFixed(0)}</Text>
                                            <Text style={styles.confirmSubtext}>Tap to confirm your payment</Text>
                                        </View>
                                        <View style={styles.confirmIcon}>
                                            <Ionicons name="checkmark-done" size={22} color="#4CAF50" />
                                        </View>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Security Footer */}
                    <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.securityRow}>
                        <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                        <Text style={styles.securityText}>100% Secure & Encrypted</Text>
                    </Animated.View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    content: {
        width: '100%',
        backgroundColor: '#161414',
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: '#2A2525',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
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
    },

    // Amount Card
    amountCard: {
        alignItems: 'center',
        borderRadius: 18,
        paddingVertical: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 106, 0, 0.15)',
    },
    amountLabel: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
    },
    amountValue: {
        color: '#FF6A00',
        fontSize: 38,
        fontFamily: 'Poppins_700Bold',
    },

    // UPI Button
    upiCard: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    upiCardDone: {
        opacity: 0.85,
    },
    upiGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 18,
    },
    upiTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    upiSubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        marginTop: 2,
    },

    // Step Badge
    stepBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
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

    // Confirm Button (I Have Paid)
    confirmCard: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.25)',
    },
    confirmTitle: {
        color: '#4CAF50',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
    },
    confirmSubtext: {
        color: 'rgba(76, 175, 80, 0.6)',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        marginTop: 2,
    },
    confirmIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(76, 175, 80, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Security
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 18,
    },
    securityText: {
        color: '#555',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
    },
});
