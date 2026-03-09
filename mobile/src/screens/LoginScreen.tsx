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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

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
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.form}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={GRADIENTS.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>C</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={(text) => { setEmail(text); }}
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
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(text) => { setPassword(text); }}
              secureTextEntry={!showPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

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
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to ONECINEHUB?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkHighlight}> Create Account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: { 
    width: '100%', 
    flex: 1, 
    justifyContent: 'center',
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  logoWrapper: {
    marginBottom: 16,
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
    fontWeight: '800',
    color: '#fff',
  },
  logo: {
    fontSize: 32, 
    fontWeight: '700', 
    color: COLORS.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  tagline: { 
    fontSize: 12, 
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  welcomeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLarge,
    padding: 24,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    textAlign: 'center',
  },
  inputContainer: { 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius,
    marginBottom: 16, 
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
    marginLeft: 16,
  },
  input: { 
    flex: 1, 
    padding: 16, 
    color: COLORS.text, 
    fontSize: 16 
  },
  eyeButton: { 
    padding: 16 
  },
  eyeText: { 
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600'
  },
  buttonGradient: {
    borderRadius: SIZES.radius,
    ...SHADOWS.glow,
  },
  button: { 
    backgroundColor: 'transparent', 
    padding: 18, 
    borderRadius: SIZES.radius, 
    alignItems: 'center',
  },
  buttonText: { 
    color: COLORS.text, 
    fontSize: 17, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: { 
    color: COLORS.textSecondary, 
    fontSize: 14 
  },
  linkHighlight: { 
    color: COLORS.primary, 
    fontSize: 14, 
    fontWeight: '700' 
  },
});

