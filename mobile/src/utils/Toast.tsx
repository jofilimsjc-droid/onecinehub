import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
}

export function Toast({ visible, message, type, onHide, duration = 3000 }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, translateY, opacity]);

  if (!visible) return null;

  // Friendly colors and icons
  const backgroundColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'cancel' : 'info';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor,
        },
      ]}
    >
      <MaterialIcons name={iconName as any} size={22} color="#fff" style={styles.icon} />
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

// Toast helper functions
let toastRef: any = null;

export const showToast = {
  success: (message: string) => toastRef?.show(message, 'success'),
  error: (message: string) => toastRef?.show(message, 'error'),
  info: (message: string) => toastRef?.show(message, 'info'),
};

export const setToastRef = (ref: any) => {
  toastRef = ref;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});

