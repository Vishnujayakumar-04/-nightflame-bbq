import { View, Text } from 'react-native';

import { OrderStatus } from '../../constants/enums';

interface StatusBadgeProps {
    status: OrderStatus;
    large?: boolean;
}

export const StatusBadge = ({ status, large = false }: StatusBadgeProps) => {
    const getStatusConfig = () => {
        switch (status) {
            case OrderStatus.PENDING:
                return { color: '#F59E0B', label: 'Pending', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
            case OrderStatus.PREPARING:
                return { color: '#3B82F6', label: 'Preparing', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' };
            case OrderStatus.READY:
                return { color: '#10B981', label: 'Ready for Pickup', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
            case OrderStatus.COMPLETED:
                return { color: '#6B7280', label: 'Completed', bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)' };
            default:
                return { color: '#6B7280', label: 'Unknown', bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)' };
        }
    };

    const config = getStatusConfig();

    return (
        <View
            className="flex-row items-center border"
            style={{
                backgroundColor: config.bg,
                borderColor: config.border,
                borderRadius: large ? 10 : 8,
                paddingHorizontal: large ? 16 : 10,
                paddingVertical: large ? 8 : 4,
            }}
        >
            <View
                style={{
                    width: large ? 10 : 8,
                    height: large ? 10 : 8,
                    borderRadius: large ? 5 : 4,
                    backgroundColor: config.color,
                }}
            />
            <Text
                className="font-[Inter_600SemiBold]"
                style={{
                    color: config.color,
                    fontSize: large ? 14 : 12,
                    marginLeft: large ? 8 : 6,
                }}
            >
                {config.label}
            </Text>
        </View>
    );
};
