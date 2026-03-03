export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum PaymentStatus {
    UNPAID = 'Unpaid',
    PAYMENT_INITIATED = 'Payment Initiated',
    PAID = 'Paid',
    REFUNDED = 'Refunded'
}

export enum PaymentType {
    PAY_NOW = 'PayNow',
    PAY_LATER = 'PayLater'
}

export enum PaymentMethod {
    CASH = 'Cash',
    UPI = 'UPI',
    NONE = 'None'
}

export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin'
}

