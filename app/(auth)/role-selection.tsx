import { View, Text, Image, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

                {/* Top Fire Image Header */}
                <Animated.View entering={FadeIn.duration(800)} style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/LOGO.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>Roadside BBQ • Est. 2019</Text>
                </Animated.View>

                {/* Welcome Text */}
                <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome back</Text>
                    <Text style={styles.welcomeSubtitle}>Choose how you want to continue</Text>
                </Animated.View>

                {/* Role Selection Cards */}
                <Animated.View entering={FadeInDown.delay(500).duration(700)} style={styles.cardsContainer}>
                    {/* Customer Card */}
                    <Pressable onPress={() => router.push('/(auth)/enter-name')}>
                        {({ pressed }) => (
                            <View style={[
                                styles.roleCard,
                                styles.customerCard,
                                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                            ]}>
                                <View style={styles.roleIconContainer}>
                                    <Ionicons name="call" size={22} color="#FF6A00" />
                                </View>
                                <View style={styles.roleTextContainer}>
                                    <Text style={styles.roleTitle}>I'm a Customer</Text>
                                    <Text style={styles.roleSubtitle}>Pre-order, track & pay</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#757575" />
                            </View>
                        )}
                    </Pressable>

                    {/* Staff / Admin Card */}
                    <Pressable onPress={() => router.push('/(auth)/admin-login')}>
                        {({ pressed }) => (
                            <View style={[
                                styles.roleCard,
                                styles.adminCard,
                                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                            ]}>
                                <View style={[styles.roleIconContainer, { backgroundColor: 'rgba(229, 59, 10, 0.15)' }]}>
                                    <Ionicons name="shield-checkmark" size={22} color="#E53B0A" />
                                </View>
                                <View style={styles.roleTextContainer}>
                                    <Text style={styles.roleTitle}>Staff / Admin</Text>
                                    <Text style={styles.roleSubtitle}>Manage orders & menu</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#757575" />
                            </View>
                        )}
                    </Pressable>
                </Animated.View>

                {/* Demo hint */}
                <Animated.Text entering={FadeInDown.delay(700).duration(700)} style={styles.demoText}>
                    Demo: Admin PIN is 1234
                </Animated.Text>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        paddingTop: 20,
        marginBottom: 30,
    },
    logo: {
        width: width * 0.45,
        height: width * 0.45,
    },
    subtitle: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginTop: -5,
        letterSpacing: 0.5,
    },
    welcomeSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 6,
    },
    welcomeSubtitle: {
        color: '#A5A2A2',
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
    },
    cardsContainer: {
        width: '100%',
        paddingHorizontal: 24,
        gap: 14,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
    },
    customerCard: {
        backgroundColor: '#1E1A17',
        borderColor: '#3A2E20',
    },
    adminCard: {
        backgroundColor: '#1A1614',
        borderColor: '#352A20',
    },
    roleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 106, 0, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    roleTextContainer: {
        flex: 1,
    },
    roleTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 3,
    },
    roleSubtitle: {
        color: '#A5A2A2',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    demoText: {
        color: '#5A4030',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginTop: 32,
    },
});
