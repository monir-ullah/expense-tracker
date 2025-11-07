import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Screen } from '../styles/Screen';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const [isDark, setIsDark] = useState(theme.mode === 'dark');

  const anim = useRef(new Animated.Value(theme.mode === 'dark' ? 1 : 0)).current;

  useEffect(() => {
    // keep local state in sync with context changes
    const dark = theme.mode === 'dark';
    setIsDark(dark);
    Animated.timing(anim, {
      toValue: dark ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [theme.mode]);

  const toggle = () => {
    toggleTheme();
  };

  const knobTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#EDEEF2', '#22303B']
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Appearance</Text>

        <View style={styles.row}>
          <View>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Dark mode</Text>
            <Text style={[styles.optionSub, { color: theme.colors.muted }]}>Use dark theme across the app</Text>
          </View>

          <TouchableOpacity onPress={toggle} activeOpacity={0.9}>
            <Animated.View style={[styles.switchTrack, { backgroundColor: trackColor }]}>
              <Animated.View style={[styles.switchKnob, { transform: [{ translateX: knobTranslate }] }]}>
                <Feather name={isDark ? 'moon' : 'sun'} size={14} color={isDark ? '#fff' : '#F6A623'} />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Account</Text>
        <View style={styles.rowSpace}>
          <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Profile</Text>
          <Feather name="chevron-right" size={20} color={theme.colors.muted} />
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionSub: {
    fontSize: 13,
    marginTop: 4,
  },
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 30,
    justifyContent: 'center',
    padding: 4,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

