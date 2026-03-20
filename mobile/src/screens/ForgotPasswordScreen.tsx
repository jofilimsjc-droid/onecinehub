import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, FONTS, RADIUS, SPACING } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast('Please enter your email', 'error');
      return;
    }
    if (!trimmedEmail.toLowerCase().endsWith('@gmail.com')) {
      showToast('Only Gmail addresses are allowed', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.requestPasswordReset(trimmedEmail);
      if (!res.success) {
        showToast(res.message || 'Failed to request OTP', 'error');
        return;
      }

      showToast(res.message || 'OTP requested. Check your email.', 'success');
      navigation.navigate('ResetPassword', { email: trimmedEmail });
    } catch (e: any) {
      showToast(e?.message || 'Unable to connect', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={GRADIENTS.background as any} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <LinearGradient colors={GRADIENTS.primary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoGradient}>
                  <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
                </LinearGradient>
              </View>
              <Text style={styles.logoText}>ONECINEHUB</Text>
              <Text style={styles.tagline}>Reset Your Password</Text>
            </View>

            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>Forgot Password</Text>
              <Text style={styles.subtitle}>Enter your email to receive an OTP</Text>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <LinearGradient colors={GRADIENTS.primary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
              <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remembered your password?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkHighlight}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxl },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  logoWrapper: { marginBottom: SPACING.lg },
  logoGradient: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow },
  logoImage: { width: 76, height: 76 },
  logoText: { fontSize: FONTS.display, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.xs, letterSpacing: 1 },
  tagline: { fontSize: FONTS.sm, color: COLORS.textMuted, letterSpacing: 0.5 },
  welcomeCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl, ...SHADOWS.medium, },
  welcomeText: { fontSize: FONTS.xxl, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, textAlign: 'center' },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
    paddingHorizontal: SPACING.lg,
  },
  inputIcon: { fontSize: 18, marginRight: SPACING.lg },
  input: { flex: 1, paddingVertical: SPACING.lg, color: COLORS.text, fontSize: FONTS.md },
  buttonGradient: { borderRadius: RADIUS.lg, ...SHADOWS.glow },
  button: { backgroundColor: 'transparent', padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center' },
  buttonText: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '800', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.md },
  linkHighlight: { color: COLORS.primary, fontSize: FONTS.md, fontWeight: '800' },
});

