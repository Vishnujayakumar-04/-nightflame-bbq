import { View, Text, Image, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RoleCard = ({ title, subtitle, icon, color, onPress, delay }: { title: string, subtitle: string, icon: string, color: string, onPress: () => void, delay: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
            <AnimatedPressable
                onPress={onPress}
                onPressIn={() => (scale.value = withSpring(0.97))}
                onPressOut={() => (scale.value = withSpring(1))}
                style={[styles.roleCard, animatedStyle]}
            >
                <View style={[styles.roleIconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                </View>
                <View style={styles.roleTextContainer}>
                    <Text style={styles.roleTitle}>{title}</Text>
                    <Text style={styles.roleSubtitle}>{subtitle}</Text>
                </View>
                <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={color} />
                </View>
            </AnimatedPressable>
        </Animated.View>
    );
};

export default function RoleSelectionScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0A0A', '#121212']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

                {/* Centered Logo */}
                <Animated.View entering={FadeIn.duration(800)} style={styles.logoWrapper}>
                    <Image
                        source={require('../../assets/LOGO.png')}
                        style={styles.centerLogo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Welcome Text */}
                <View style={styles.welcomeSection}>
                    <Animated.View entering={FadeInDown.delay(200).duration(700)}>
                        <Text style={styles.preTitle}>CHOOSE YOUR PATH</Text>
                        <Text style={styles.welcomeTitle}>WELCOME</Text>
                        <View style={styles.titleUnderline} />
                    </Animated.View>
                </View>

                {/* Role Selection Cards */}
                <View style={styles.cardsContainer}>
                    <RoleCard
                        title="I'm a Customer"
                        subtitle="Order, Track & Taste the Flame"
                        icon="restaurant"
                        color="#FF6A00"
                        delay={400}
                        onPress={() => router.push('/(auth)/login')}
                    />

                    <RoleCard
                        title="Staff / Admin"
                        subtitle="Manage Orders & Kitchen Flow"
                        icon="shield-checkmark"
                        color="#E53B0A"
                        delay={550}
                        onPress={() => router.push('/(auth)/admin-login')}
                    />
                </View>

                {/* Footer Section */}
                <Animated.View entering={FadeInDown.delay(700).duration(700)} style={styles.footer}>
                    <Text style={styles.demoText}>Demo Environment Active</Text>
                    <View style={styles.demoBadge}>
                        <Text style={styles.demoBadgeText}>PIN: 1234</Text>
                    </View>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    safeArea: {
        flex: 1,
    },
    logoWrapper: {
        alignItems: 'center',
        marginTop: width * 0.15,
        marginBottom: -10, // Pull text closer to logo
    },
    centerLogo: {
        width: 120,
        height: 120,
    },
    welcomeSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 50,
    },
    preTitle: {
        color: '#FF6A00',
        fontSize: 12,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeTitle: {
        color: '#FFFFFF',
        fontSize: 42,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 6,
        textAlign: 'center',
    },
    titleUnderline: {
        height: 3,
        width: 40,
        backgroundColor: '#FF6A00',
        alignSelf: 'center',
        marginTop: 4,
        borderRadius: 2,
    },
    cardsContainer: {
        width: '100%',
        paddingHorizontal: 24,
        gap: 20,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#1A1817',
        borderWidth: 1,
        borderColor: '#2A2522',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    roleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    roleTextContainer: {
        flex: 1,
    },
    roleTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        marginBottom: 4,
    },
    roleSubtitle: {
        color: '#A5A2A2',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingBottom: 40,
    },
    demoText: {
        color: '#5A4030',
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    demoBadge: {
        backgroundColor: 'rgba(90, 64, 48, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(90, 64, 48, 0.2)',
    },
    demoBadgeText: {
        color: '#5A4030',
        fontSize: 11,
        fontFamily: 'Inter_700Bold',
    },
});
