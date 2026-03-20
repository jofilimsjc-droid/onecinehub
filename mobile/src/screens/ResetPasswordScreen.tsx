import React, { useMemo, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { showToast } = useToast();

  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = useMemo(() => newPassword !== '' && newPassword === confirmPassword, [newPassword, confirmPassword]);
  const passwordLengthOk = useMemo(() => newPassword.length >= 8, [newPassword]);

  const handleReset = async () => {
    const trimmedOtp = otp.trim();

    if (!trimmedOtp || !/^\d{6}$/.test(trimmedOtp)) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (!passwordLengthOk) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (!passwordsMatch) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPasswordWithOtp(email, trimmedOtp, newPassword, confirmPassword);
      if (!res.success) {
        showToast(res.message || 'Failed to reset password', 'error');
        return;
      }

      showToast(res.message || 'Password updated successfully', 'success');
      setTimeout(() => navigation.navigate('Login'), 1200);
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
              <Text style={styles.tagline}>OTP Verification</Text>
            </View>

            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>Reset Password</Text>
              <Text style={styles.subtitle}>We sent an OTP to: {email}</Text>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="pin" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="6-digit OTP"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={(text) => {
                  // Keep OTP strictly numeric and limited to 6 digits.
                  const cleaned = text.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainerWithIconRow}>
              <MaterialIcons name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={COLORS.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainerWithIconRow}>
              <MaterialIcons name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
                <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <Text
                  style={[
                    styles.matchText,
                    passwordsMatch ? styles.matchTextValid : styles.matchTextInvalid,
                  ]}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
                {!passwordLengthOk && <Text style={styles.helperText}>Password must be at least 8 characters</Text>}
              </View>
            )}

            <LinearGradient colors={GRADIENTS.primary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
              <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
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
  logoText: { fontSize: FONTS.display, fontWeight: '900', color: COLORS.primary, marginBottom: SPACING.xs, letterSpacing: 1 },
  tagline: { fontSize: FONTS.sm, color: COLORS.textMuted, letterSpacing: 0.5 },
  welcomeCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl, ...SHADOWS.medium },
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
  inputContainerWithIconRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
    paddingHorizontal: SPACING.lg,
    overflow: 'hidden',
  },
  inputIcon: { fontSize: 18, marginRight: SPACING.lg },
  input: { flex: 1, paddingVertical: SPACING.lg, color: COLORS.text, fontSize: FONTS.md },
  eyeButton: { padding: SPACING.lg },
  buttonGradient: { borderRadius: RADIUS.lg, ...SHADOWS.glow },
  button: { backgroundColor: 'transparent', padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center' },
  buttonText: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '900', letterSpacing: 0.5 },
  matchContainer: { marginBottom: SPACING.md },
  matchText: { fontSize: FONTS.md, fontWeight: '600', marginBottom: SPACING.sm },
  matchTextValid: { color: COLORS.success },
  matchTextInvalid: { color: COLORS.error },
  helperText: { color: COLORS.warning, fontSize: FONTS.sm },
  backLink: { alignSelf: 'center', marginTop: SPACING.md },
  backLinkText: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sm },
});

