import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './ui/Button';
import { openUpiPayment, getMerchantUpiId } from '../utils/upiPayment';

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

    const handlePayViaApp = async () => {
        setIsOpeningUpi(true);
        const opened = await openUpiPayment(amount, orderId || 'ORDER');
        setIsOpeningUpi(false);
        // If UPI app was opened, user will come back after paying
        // We don't auto-confirm; they click "I Have Paid" when they return
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Pay {`₹${amount.toFixed(0)}`}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    {/* Amount Display */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total Payable</Text>
                        <Text style={styles.amountValue}>₹{amount.toFixed(0)}</Text>
                    </View>

                    {/* Pay via UPI App — Primary Action */}
                    <TouchableOpacity
                        style={styles.upiAppButton}
                        onPress={handlePayViaApp}
                        activeOpacity={0.85}
                        disabled={isOpeningUpi}
                    >
                        <LinearGradient
                            colors={['#FF6A00', '#E53B0A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upiAppGradient}
                        >
                            {isOpeningUpi ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="phone-portrait-outline" size={22} color="#FFFFFF" />
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text style={styles.upiAppTitle}>Pay via UPI App</Text>
                                        <Text style={styles.upiAppSubtitle}>Opens GPay, PhonePe, Paytm etc.</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider with "or" */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or scan QR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* QR Code — Secondary/Fallback */}
                    <View style={styles.qrContainer}>
                        <Image
                            source={require('../assets/Payment/Paytm_Qr.jpeg')}
                            style={{ width: 200, height: 200, borderRadius: 8 }}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                        />
                    </View>

                    {/* UPI ID display */}
                    <View style={styles.upiIdRow}>
                        <Ionicons name="at-outline" size={16} color="#757575" />
                        <Text style={styles.upiIdText}>UPI ID: {getMerchantUpiId()}</Text>
                    </View>

                    {/* I Have Paid Button */}
                    <View style={{ marginTop: 20 }}>
                        <Button
                            title={`I Have Paid ₹${amount.toFixed(0)}`}
                            onPress={onPaid}
                            loading={isLoading}
                            icon={<Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />}
                        />
                    </View>

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
        padding: 20
    },
    content: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#353030'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    title: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins_700Bold' },
    closeBtn: { padding: 4 },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(255, 106, 0, 0.06)',
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 106, 0, 0.15)',
    },
    amountLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    amountValue: { color: '#FF6A00', fontSize: 36, fontFamily: 'Poppins_700Bold' },
    upiAppButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
    upiAppGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    upiAppTitle: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    upiAppSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#353030' },
    dividerText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginHorizontal: 12 },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        alignSelf: 'center',
    },
    upiIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    upiIdText: { color: '#757575', fontSize: 12, fontFamily: 'Inter_500Medium' },
});
