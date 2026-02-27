import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1A1818',
                    borderTopColor: '#2A2525',
                    borderTopWidth: 1,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: '#FF6A00',
                tabBarInactiveTintColor: '#757575',
                tabBarLabelStyle: {
                    fontFamily: 'Inter_400Regular',
                    fontSize: 10,
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="walk-in"
                options={{
                    title: 'New',
                    tabBarIcon: () => (
                        <View style={styles.newButton}>
                            <Ionicons name="add-circle" size={36} color="#FF6A00" />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="menu-management"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu-form"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    newButton: {
        marginBottom: -6,
    },
});
