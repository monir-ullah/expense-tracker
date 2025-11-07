import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, containerStyles } from './globalStyles';
import { useTheme } from '../context/ThemeContext';

export const Screen = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const barStyle = theme.mode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView 
      style={[
        containerStyles.screenContainer,
        { backgroundColor: theme.colors.background },
        {
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style
      ]}
    >
      <StatusBar 
        barStyle={barStyle}
        backgroundColor={theme.colors.background} 
        translucent 
      />
      {children}
    </SafeAreaView>
  );
};