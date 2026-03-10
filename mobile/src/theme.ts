import { Dimensions, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Export MaterialIcons for use across the app
export { MaterialIcons };

// Responsive breakpoints
export const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
};

// Device info
export const DEVICE = {
  width,
  height,
  isSmall: width < BREAKPOINTS.medium,
  isMedium: width >= BREAKPOINTS.medium && width < BREAKPOINTS.large,
  isLarge: width >= BREAKPOINTS.large,
  isTablet: width >= BREAKPOINTS.tablet,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
};

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Font sizes based on device
export const FONTS = {
  xs: DEVICE.isSmall ? 10 : 11,
  sm: DEVICE.isSmall ? 12 : 13,
  md: DEVICE.isSmall ? 14 : 15,
  lg: DEVICE.isSmall ? 16 : 17,
  xl: DEVICE.isSmall ? 18 : 20,
  xxl: DEVICE.isSmall ? 22 : 24,
  xxxl: DEVICE.isSmall ? 26 : 28,
  display: DEVICE.isSmall ? 32 : 36,
};

// Border radius scale
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Theme colors - Professional modern streaming platform palette
export const COLORS = {
  // Primary brand colors
  primary: '#e50914',
  primaryDark: '#b20710',
  primaryLight: '#ff6b6b',
  
  // Background colors - refined for depth
  background: '#080808',
  surface: '#141414',
  surfaceLight: '#1f1f1f',
  surfaceLighter: '#2a2a2a',
  surfaceElevated: '#323232',
  
  // Text colors - improved readability
  text: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#525252',
  textDark: '#0a0a0a',
  
  // Semantic colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  
  // Accent colors
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  green: '#22c55e',
  greenLight: '#4ade80',
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  cyan: '#06b6d4',
  cyanLight: '#22d3ee',
  
  // Border colors
  border: '#262626',
  borderLight: '#404040',
  
  // Overlay colors
  overlay: 'rgba(0,0,0,0.75)',
  overlayLight: 'rgba(0,0,0,0.5)',
  overlayDark: 'rgba(0,0,0,0.9)',
  
  // Utility colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Card backgrounds
  card: '#1a1a1a',
  cardBorder: '#2d2d2d',
};

// Gradients
export const GRADIENTS = {
  primary: ['#e50914', '#b20710'],
  primaryLight: ['#ff6b6b', '#e50914'],
  primaryDark: ['#b20710', '#8b0000'],
  background: ['#1a1a1a', '#0a0a0a'],
  card: ['#252525', '#1a1a1a'],
  cardElevated: ['#333333', '#252525'],
  overlay: ['transparent', 'rgba(0,0,0,0.9)'],
  gold: ['#fbbf24', '#f59e0b'],
  goldLight: ['#fcd34d', '#fbbf24'],
  success: ['#22c55e', '#16a34a'],
  successLight: ['#4ade80', '#22c55e'],
  warning: ['#fbbf24', '#f59e0b'],
  warningLight: ['#fcd34d', '#fbbf24'],
  error: ['#ef4444', '#dc2626'],
  errorLight: ['#f87171', '#ef4444'],
  purple: ['#6366f1', '#4f46e5'],
  purpleLight: ['#818cf8', '#6366f1'],
  blue: ['#3b82f6', '#2563eb'],
  blueLight: ['#60a5fa', '#3b82f6'],
  surface: ['#252525', '#1a1a1a'],
  surfaceLight: ['#333333', '#252525'],
};

// Shadows - using numbered keys for backward compatibility
export const SHADOWS = {
  none: {},
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  glow: {
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowGold: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowSuccess: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
};

// Responsive sizing helpers
export const SIZES = {
  // Device dimensions
  width,
  height,
  
  // Responsive breakpoints
  ...BREAKPOINTS,
  
  // Common sizes
  padding: SPACING.lg,
  paddingSmall: SPACING.md,
  paddingLarge: SPACING.xl,
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.md,
  
  // Border radius
  radius: RADIUS.lg,
  radiusSmall: RADIUS.sm,
  radiusLarge: RADIUS.xl,
  radiusXL: RADIUS.xxl,
  radiusRound: RADIUS.full,
  
  // Header heights
  headerHeight: DEVICE.isIOS ? 88 : 56,
  tabBarHeight: DEVICE.isIOS ? 85 : 65,
  statusBarHeight: DEVICE.statusBarHeight,
  
  // Common dimensions
  buttonHeight: 52,
  inputHeight: 52,
  iconSize: 24,
  iconSizeSmall: 18,
  iconSizeLarge: 28,
  avatarSize: 80,
  avatarSizeSmall: 48,
  avatarSizeLarge: 100,
  
  // Card dimensions
  cardWidth: (width - SPACING.lg * 3) / 2,
  cardAspectRatio: 2 / 3,
  
  // Movie poster
  posterWidth: width * 0.45,
  posterHeight: width * 0.45 * 1.5,
  
  // Horizontal card
  horizontalCardHeight: 120,
  
  // List item
  listItemHeight: 72,
  
  // Icon buttons
  iconButtonSize: 44,
  iconButtonSizeSmall: 36,
};

// Common style helpers
export const GLOBAL_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: DEVICE.statusBarHeight,
  },
  screenPadding: {
    paddingHorizontal: SPACING.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardElevated: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonDisabled: {
    backgroundColor: COLORS.surfaceLighter,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: '600',
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: FONTS.md,
    color: COLORS.text,
    lineHeight: Math.round(FONTS.md * 1.5),
  },
  caption: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: FONTS.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};

