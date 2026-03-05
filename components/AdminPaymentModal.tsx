import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { PaymentMethod } from '../constants/enums';

interface AdminPaymentModalProps {
    visible: boolean;
    orderId: string;
    amount: number;
    customerName: string;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: (method: PaymentMethod.CASH | PaymentMethod.UPI, transactionId?: string) => Promise<void>;
}

export function AdminPaymentModal({ visible, orderId, amount, customerName, isLoading, onClose, onConfirm }: AdminPaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod.CASH | PaymentMethod.UPI>(PaymentMethod.UPI);
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(selectedMethod, selectedMethod === PaymentMethod.UPI ? transactionId : undefined);
            // Reset state after success
            setTransactionId('');
            setSelectedMethod(PaymentMethod.UPI);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={isLoading || isSubmitting ? undefined : onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Confirm Payment</Text>
                        <TouchableOpacity disabled={isLoading || isSubmitting} onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    {/* Order Details */}
                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsLabel}>Order ID: <Text style={styles.detailsValue}>{orderId.slice(-5).toUpperCase()}</Text></Text>
                        <Text style={styles.detailsLabel}>Customer: <Text style={styles.detailsValue}>{customerName || 'Walk-in'}</Text></Text>
                        <View style={styles.amountWrap}>
                            <Text style={styles.amountLabel}>Collect</Text>
                            <Text style={styles.amountValue}>₹{amount.toFixed(0)}</Text>
                        </View>
                    </View>

                    {/* Payment Method Tabs */}
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabBtn, selectedMethod === PaymentMethod.UPI && styles.tabBtnActive]}
                            onPress={() => setSelectedMethod(PaymentMethod.UPI)}
                        >
                            <Ionicons name="qr-code-outline" size={18} color={selectedMethod === PaymentMethod.UPI ? '#FFFFFF' : '#A5A2A2'} />
                            <Text style={[styles.tabText, selectedMethod === PaymentMethod.UPI && styles.tabTextActive]}>UPI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, selectedMethod === PaymentMethod.CASH && styles.tabBtnActive]}
                            onPress={() => setSelectedMethod(PaymentMethod.CASH)}
                        >
                            <Ionicons name="cash-outline" size={18} color={selectedMethod === PaymentMethod.CASH ? '#FFFFFF' : '#A5A2A2'} />
                            <Text style={[styles.tabText, selectedMethod === PaymentMethod.CASH && styles.tabTextActive]}>Cash</Text>
                        </TouchableOpacity>
                    </View>

                    {/* UPI Details & QR */}
                    {selectedMethod === PaymentMethod.UPI && (
                        <View>
                            {/* QR Display for Admin to show customer */}
                            <View style={styles.qrContainer}>
                                <View style={styles.qrWrapper}>
                                    <Image
                                        source={require('../assets/Payment/IMG_20260305_105900.png')}
                                        style={styles.qrImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.qrHint}>Customer scans this to pay</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Transaction ID (Optional but Recommended)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. 123456789012"
                                    placeholderTextColor="#555"
                                    value={transactionId}
                                    onChangeText={setTransactionId}
                                />
                            </View>
                        </View>
                    )}

                    {/* Action */}
                    <View style={{ marginTop: 32 }}>
                        <Button
                            title="Mark as Paid"
                            size="large"
                            onPress={handleConfirm}
                            loading={isLoading || isSubmitting}
                            icon={<Ionicons name="checkmark-done" size={22} color="#FFFFFF" />}
                        />
                    </View>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#353030',
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_700Bold' },
    closeBtn: { padding: 4 },
    detailsBox: {
        backgroundColor: '#2A2525',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20
    },
    detailsLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    detailsValue: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    amountWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#353030'
    },
    amountLabel: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    amountValue: { color: '#4CAF50', fontSize: 24, fontFamily: 'Poppins_700Bold' },
    sectionTitle: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#2A2525',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
        borderRadius: 8
    },
    tabBtnActive: {
        backgroundColor: '#FF6A00'
    },
    tabText: { color: '#A5A2A2', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    tabTextActive: { color: '#FFFFFF' },
    inputContainer: { marginBottom: 24 },
    inputLabel: { color: '#A5A2A2', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 8 },
    textInput: {
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#FFFFFF',
        fontFamily: 'Inter_400Regular',
        fontSize: 15
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#2A2525',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#353030'
    },
    qrWrapper: {
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 12,
        marginBottom: 8
    },
    qrImage: {
        width: 180,
        height: 180
    },
    qrHint: {
        color: '#A5A2A2',
        fontSize: 12,
        fontFamily: 'Inter_400Regular'
    }
});
