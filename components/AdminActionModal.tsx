import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Order } from '../types/models';
import { Button } from './ui/Button';
import { OrderStatus, PaymentStatus } from '../constants/enums';

interface AdminActionModalProps {
    visible: boolean;
    order: Order | null;
    onClose: () => void;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    onCollectPayment: (order: Order) => void;
}

export function AdminActionModal({
    visible,
    order,
    onClose,
    onUpdateStatus,
    onCollectPayment
}: AdminActionModalProps) {
    if (!order) return null;

    const renderAction = () => {
        const { status, paymentStatus, orderId } = order;

        if (status === OrderStatus.PENDING) {
            return (
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(orderId, OrderStatus.ACCEPTED)}
                >
                    <LinearGradient colors={['#FF6A00', '#E53B0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGradient}>
                        <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
                        <Text style={styles.actionBtnText}>Accept Order</Text>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        if (status === OrderStatus.ACCEPTED) {
            return (
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(orderId, OrderStatus.PREPARING)}
                >
                    <LinearGradient colors={['#FF6A00', '#E53B0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGradient}>
                        <Ionicons name="flame-outline" size={22} color="#FFF" />
                        <Text style={styles.actionBtnText}>Start Preparing</Text>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        if (status === OrderStatus.PREPARING) {
            return (
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(orderId, OrderStatus.READY)}
                >
                    <LinearGradient colors={['#FF6A00', '#E53B0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGradient}>
                        <Ionicons name="restaurant-outline" size={22} color="#FFF" />
                        <Text style={styles.actionBtnText}>Mark as Ready</Text>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        if (status === OrderStatus.READY) {
            if (paymentStatus !== PaymentStatus.PAID) {
                return (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onCollectPayment(order)}
                    >
                        <LinearGradient colors={['#FF6A00', '#E53B0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGradient}>
                            <Ionicons name="cash-outline" size={22} color="#FFF" />
                            <Text style={styles.actionBtnText}>Collect Payment</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onUpdateStatus(orderId, OrderStatus.COMPLETED)}
                    >
                        <LinearGradient colors={['#4CAF50', '#388E3C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGradient}>
                            <Ionicons name="checkmark-done" size={22} color="#FFF" />
                            <Text style={styles.actionBtnText}>Complete Order</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                );
            }
        }

        return (
            <Text style={styles.completedText}>
                Order is already {status}.
            </Text>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Order #{order.orderId.substring(0, 5).toUpperCase()}</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsText}>Customer: <Text style={styles.boldText}>{order.customerName || 'Walk-in'}</Text></Text>
                        <Text style={styles.detailsText}>Amount: <Text style={styles.amountText}>₹{order.totalAmount.toFixed(0)}</Text></Text>
                        <Text style={styles.detailsText}>Payment: <Text style={[styles.boldText, order.paymentStatus === PaymentStatus.PAID ? { color: '#4CAF50' } : { color: '#FF9800' }]}>{order.paymentStatus}</Text></Text>
                    </View>

                    <Text style={styles.actionLabel}>Next Step</Text>
                    <View style={styles.buttonContainer}>
                        {renderAction()}
                    </View>
                </Pressable>
            </Pressable>
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
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
    },
    detailsBox: {
        backgroundColor: '#252121',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#353030',
    },
    detailsText: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginBottom: 6,
    },
    boldText: {
        color: '#FFFFFF',
        fontFamily: 'Inter_600SemiBold',
    },
    amountText: {
        color: '#FF6A00',
        fontFamily: 'Poppins_700Bold',
        fontSize: 15,
    },
    actionLabel: {
        color: '#757575',
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    buttonContainer: {
        marginTop: 4,
    },
    actionBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 16, borderRadius: 14,
    },
    actionBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    completedText: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        paddingVertical: 12,
    }
});

