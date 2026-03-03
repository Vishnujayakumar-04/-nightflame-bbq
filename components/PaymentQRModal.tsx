import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';

interface PaymentQRModalProps {
    visible: boolean;
    amount: number;
    isLoading: boolean;
    onClose: () => void;
    onPaid: () => void;
}

export function PaymentQRModal({ visible, amount, isLoading, onClose, onPaid }: PaymentQRModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Scan to Pay</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    {/* QR Code - Actual Payment QR */}
                    <View style={styles.qrContainer}>
                        <Image
                            source={require('../assets/Payment/Paytm_Qr.jpeg')}
                            style={{ width: 200, height: 200, borderRadius: 8 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.qrHelpText}>Scan via Any UPI App</Text>
                    </View>

                    {/* Amount */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total Payable</Text>
                        <Text style={styles.amountValue}>₹{amount.toFixed(0)}</Text>
                    </View>

                    {/* Action */}
                    <View style={{ marginTop: 24 }}>
                        <Button
                            title={`I Have Paid ₹${amount.toFixed(0)}`}
                            onPress={onPaid}
                            loading={isLoading}
                            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
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
        marginBottom: 24
    },
    title: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Poppins_700Bold' },
    closeBtn: { padding: 4 },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24
    },
    qrHelpText: { color: '#555', fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 12 },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 24
    },
    amountLabel: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    amountValue: { color: '#FF6A00', fontSize: 36, fontFamily: 'Poppins_700Bold' },
});
