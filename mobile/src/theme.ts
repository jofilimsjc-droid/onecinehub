import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Theme constants - extracted from App.tsx to avoid circular dependency
export const COLORS = {
  primary: '#e50914',
  primaryDark: '#b20710',
  primaryLight: '#ff6b6b',
  background: '#000000',
  surface: '#1a1a1a',
  surfaceLight: '#252525',
  surfaceLighter: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textMuted: '#666666',
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#ef4444',
  gold: '#fbbf24',
  green: '#46d369',
  purple: '#6366f1',
};

export const GRADIENTS = {
  primary: ['#e50914', '#b20710'],
  primaryLight: ['#ff6b6b', '#e50914'],
  background: ['#1a1a1a', '#000000'],
  card: ['#252525', '#1a1a1a'],
  overlay: ['transparent', 'rgba(0,0,0,0.9)'],
  gold: ['#fbbf24', '#f59e0b'],
  success: ['#22c55e', '#16a34a'],
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  glow: {
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  glowGold: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const SIZES = {
  width,
  height,
  padding: 16,
  radius: 12,
  radiusSmall: 8,
  radiusLarge: 16,
  radiusXL: 24,
};

