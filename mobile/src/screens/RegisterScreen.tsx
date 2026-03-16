import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING, DEVICE } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const passwordStrength = [hasUppercase, hasLowercase, hasNumber, hasSpecial, passwordLength].filter(Boolean).length;

  const getStrengthColor = () => {
    if (passwordStrength < 3) return COLORS.error;
    if (passwordStrength < 5) return COLORS.warning;
    return COLORS.success;
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 3) return 'Weak';
    if (passwordStrength < 5) return 'Medium';
    return 'Strong';
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (username.trim().length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      showToast('Only Gmail addresses are allowed', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await register(username.trim(), email.trim(), password, confirmPassword);
      
      if (result.success) {
        showToast('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        showToast(result.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      showToast('Connection failed: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    value: string,
    setValue: (text: string) => void,
    placeholder: string,
    iconName: string,
    isPassword: boolean = false,
    showPassword?: boolean,
    onTogglePress?: () => void,
    keyboardType: 'default' | 'email-address' = 'default'
  ) => (
    <View style={[
      styles.inputContainer,
      focusedInput === placeholder && styles.inputContainerFocused
    ]}>
      <MaterialIcons name={iconName as any} size={18} color={COLORS.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={setValue}
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize="none"
        keyboardType={keyboardType}
        onFocus={() => setFocusedInput(placeholder)}
        onBlur={() => setFocusedInput(null)}
      />
      {isPassword && typeof showPassword === 'boolean' && (
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={onTogglePress}
        >
          <MaterialIcons 
            name={showPassword ? "visibility" : "visibility-off"} 
            size={18} 
            color={COLORS.textMuted} 
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background as any}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.form}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={GRADIENTS.primary as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <MaterialIcons name="movie" size={36} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.logo}>ONECINEHUB</Text>
              <Text style={styles.tagline}>Your Ultimate Cinema Experience</Text>
            </View>

            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitle}>Join us for an amazing movie experience</Text>
            </View>

            {renderInput(username, setUsername, 'Username', 'person')}
            {renderInput(email, setEmail, 'example@gmail.com', 'email', false, false, undefined, 'email-address')}
            
            <View>
              {renderInput(
                password, 
                setPassword, 
                'Password (min 8 characters)', 
                'lock', 
                true, 
                showPassword, 
                () => setShowPassword(!showPassword)
              )}
              
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${(passwordStrength / 5) * 100}%`, 
                          backgroundColor: getStrengthColor()
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                    {getStrengthLabel()}
                  </Text>
                </View>
              )}

              <View style={styles.requirements}>
                <View style={[styles.requirement, hasUppercase && styles.requirementValid]}>
                  <Text style={[styles.requirementText, hasUppercase && styles.requirementTextValid]}>A-Z</Text>
                </View>
                <View style={[styles.requirement, hasLowercase && styles.requirementValid]}>
                  <Text style={[styles.requirementText, hasLowercase && styles.requirementTextValid]}>a-z</Text>
                </View>
                <View style={[styles.requirement, hasNumber && styles.requirementValid]}>
                  <Text style={[styles.requirementText, hasNumber && styles.requirementTextValid]}>0-9</Text>
                </View>
                <View style={[styles.requirement, hasSpecial && styles.requirementValid]}>
                  <Text style={[styles.requirementText, hasSpecial && styles.requirementTextValid]}>@#$</Text>
                </View>
                <View style={[styles.requirement, passwordLength && styles.requirementValid]}>
                  <Text style={[styles.requirementText, passwordLength && styles.requirementTextValid]}>8+</Text>
                </View>
              </View>
            </View>

            {renderInput(
              confirmPassword, 
              setConfirmPassword, 
              'Confirm Password', 
              'lock', 
              true, 
              showConfirmPassword, 
              () => setShowConfirmPassword(!showConfirmPassword)
            )}
            
            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <Text style={[
                  styles.matchText,
                  passwordsMatch ? styles.matchTextValid : styles.matchTextInvalid
                ]}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              </View>
            )}

            <LinearGradient
              colors={GRADIENTS.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkHighlight}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
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
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingVertical: SPACING.xl 
  },
  form: { 
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: SPACING.xl 
  },
  logoWrapper: {
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  logoIcon: {
    fontSize: 36,
  },
  logoText: {
    fontSize: 36,
  },
  logo: {
    fontSize: FONTS.xxxl, 
    fontWeight: '700', 
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  tagline: { 
    fontSize: FONTS.sm, 
    color: COLORS.textMuted,
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
    marginBottom: SPACING.md, 
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
    fontSize: 18 
  },
  strengthContainer: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBar: { 
    flex: 1,
    height: 6, 
    backgroundColor: COLORS.surfaceLighter, 
    borderRadius: 3,
    marginRight: SPACING.md,
  },
  strengthFill: { 
    height: '100%', 
    borderRadius: 3,
  },
  strengthText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    minWidth: 50,
  },
  requirements: { 
    flexDirection: 'row', 
    gap: SPACING.sm, 
    marginBottom: SPACING.lg 
  },
  requirement: { 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    borderRadius: RADIUS.sm 
  },
  requirementValid: { 
    backgroundColor: 'rgba(34,197,94,0.2)' 
  },
  requirementText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.sm, 
    fontWeight: '600' 
  },
  requirementTextValid: { 
    color: COLORS.success 
  },
  matchContainer: {
    marginBottom: SPACING.md,
  },
  matchText: {
    fontSize: FONTS.md,
  },
  matchTextValid: {
    color: COLORS.success,
  },
  matchTextInvalid: {
    color: COLORS.error,
  },
  buttonGradient: {
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
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
  terms: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  termsText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    textAlign: 'center',
    lineHeight: FONTS.sm * 1.6,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
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

