import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';

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
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Select Payment</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    {!isShopOpen && (
                        <View style={styles.closedWarning}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.closedWarningText}>Shop is currently closed. Order cannot be placed.</Text>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Pay Now (UPI)"
                            onPress={onSelectPayNow}
                            icon={<Ionicons name="qr-code-outline" size={18} color="#FFF" />}
                            disabled={!isShopOpen}
                            loading={isSubmitting}
                        />
                        <View style={{ height: 16 }} />
                        <Button
                            title="Pay at Pickup"
                            variant="secondary"
                            onPress={onSelectPayLater}
                            icon={<Ionicons name="cash-outline" size={18} color={!isShopOpen ? "#A1A1AA" : "#FFF"} />}
                            disabled={!isShopOpen}
                            loading={isSubmitting}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#353030',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
    },
    buttonContainer: {
        marginTop: 8,
    },
    closedWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    closedWarningText: {
        color: '#EF4444',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        marginLeft: 8,
    }
});
