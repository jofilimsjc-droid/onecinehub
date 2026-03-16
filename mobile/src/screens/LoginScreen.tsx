import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING, DEVICE } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        showToast(result.message || 'Invalid email or password', 'error');
      } else {
        showToast('Login successful!', 'success');
      }
    } catch (err: any) {
      showToast('Unable to connect: ' + (err.message || 'Network error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background as any}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={GRADIENTS.primary as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Image
                    source={require('../../logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>
              <Text style={styles.logo}>ONECINEHUB</Text>
              <Text style={styles.tagline}>Your Ultimate Cinema Experience</Text>
            </View>

            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={[
              styles.inputContainer,
              emailFocused && styles.inputContainerFocused
            ]}>
              <MaterialIcons name="email" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
            
            <View style={[
              styles.inputContainer,
              passwordFocused && styles.inputContainerFocused
            ]}>
              <MaterialIcons name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={18} 
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => showToast('Password reset not available', 'info')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={GRADIENTS.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to ONECINEHUB?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkHighlight}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: SPACING.xxl 
  },
  logoWrapper: {
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoIcon: {
    fontSize: 36,
  },
  logoText: {
    fontSize: 40,
  },
  logo: {
    fontSize: FONTS.display,
    fontWeight: '700', 
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  tagline: { 
    fontSize: FONTS.sm, 
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  welcomeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  welcomeText: { 
    fontSize: FONTS.xxl, 
    fontWeight: '800', 
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: { 
    fontSize: FONTS.md, 
    color: COLORS.textSecondary, 
    textAlign: 'center',
  },
  inputContainer: { 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  inputIcon: {
    fontSize: 18,
    marginLeft: SPACING.lg,
  },
  input: { 
    flex: 1, 
    padding: SPACING.lg, 
    color: COLORS.text, 
    fontSize: FONTS.md 
  },
  eyeButton: { 
    padding: SPACING.lg 
  },
  eyeText: { 
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  buttonGradient: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.glow,
  },
  button: { 
    backgroundColor: 'transparent', 
    padding: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    alignItems: 'center',
  },
  buttonText: { 
    color: COLORS.text, 
    fontSize: FONTS.lg, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    fontWeight: '600',
    marginHorizontal: SPACING.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  socialIcon: {
    fontSize: 24,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.md 
  },
  linkHighlight: { 
    color: COLORS.primary, 
    fontSize: FONTS.md, 
    fontWeight: '700' 
  },
});

