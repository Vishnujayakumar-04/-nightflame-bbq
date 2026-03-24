import { Linking, Alert, Platform } from 'react-native';

// =============================================
// 🔥 Barquee Grill Station — UPI Configuration
// =============================================
// Change this to your shop's actual UPI ID
const MERCHANT_UPI_ID = 'paytmqr6jtynd@ptys';
const MERCHANT_NAME = 'Barquee Grill Station';

/**
 * Builds a standard UPI deep link URL.
 * This works with GPay, PhonePe, Paytm, BHIM, and all other UPI apps.
 *
 * @param amount   - The exact amount to pay (e.g. 259)
 * @param orderId  - The order number for the transaction note (e.g. BQ-20260324-001)
 */
export function buildUpiUrl(amount: number, orderId: string): string {
    const params = new URLSearchParams({
        pa: MERCHANT_UPI_ID,              // Payee address (UPI ID)
        pn: MERCHANT_NAME,                 // Payee name
        am: amount.toFixed(2),             // Amount
        cu: 'INR',                         // Currency
        tn: `Payment for order ${orderId}`, // Transaction note
    });

    return `upi://pay?${params.toString()}`;
}

/**
 * Opens the user's UPI app (GPay, PhonePe, etc.) with the payment amount pre-filled.
 * Shows an alert fallback if no UPI app is installed.
 *
 * @param amount   - The exact amount to pay
 * @param orderId  - Order number for the transaction note
 * @returns true if the UPI app was opened, false otherwise
 */
export async function openUpiPayment(amount: number, orderId: string): Promise<boolean> {
    const upiUrl = buildUpiUrl(amount, orderId);

    try {
        const canOpen = await Linking.canOpenURL(upiUrl);

        if (canOpen) {
            await Linking.openURL(upiUrl);
            return true;
        } else {
            Alert.alert(
                'No UPI App Found',
                'Please install a UPI app like Google Pay, PhonePe, or Paytm to make payments.',
                [{ text: 'OK' }]
            );
            return false;
        }
    } catch (error) {
        console.error('[UPI] Error opening UPI app:', error);
        Alert.alert(
            'Payment Error',
            'Could not open UPI app. Please try again or use the QR code to pay.',
            [{ text: 'OK' }]
        );
        return false;
    }
}

/**
 * Returns the merchant UPI ID (for display in UI)
 */
export function getMerchantUpiId(): string {
    return MERCHANT_UPI_ID;
}
