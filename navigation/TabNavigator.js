import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import Dashboard from "../screens/Dashboard";
import AddTransaction from "../screens/AddTransaction";
import Settings from "../screens/Settings";
import { Feather, Octicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ExpensePage from "../screens/ExpensePage";
import { createStackNavigator } from '@react-navigation/stack';
import IncomePage from "../screens/IncomePage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const getIconName = (baseName, focused) => {
  switch (baseName) {
    case "home":
      return focused ? "home" : "home-filled";
    case "credit-card":
      return focused ? "credit-card" : "credit-card";
    case "bar-chart-2":
      return focused ? "bar-chart" : "bar-chart-2";
    case "settings":
      return focused ? "settings" : "settings";
    default:
      return baseName;
  }
};

const getIconComponent = (icon, focused, theme) => {
  const activeColor = theme?.colors?.primary || "#2D3142";
  const inactiveColor = theme?.colors?.muted || "#9C9CA9";

  switch (icon) {
    case "home":
      return focused ? (
        <Octicons name="home-fill" size={22} color={activeColor} />
      ) : (
        <Feather name="home" size={22} color={inactiveColor} />
      );
    case "credit-card":
      return focused ? (
        <MaterialIcons
          name="account-balance-wallet"
          size={22}
          color={activeColor}
        />
      ) : (
        <Feather name="credit-card" size={22} color={inactiveColor} />
      );
    case "bar-chart-2":
      return focused ? (
        <MaterialIcons name="insert-chart" size={22} color={activeColor} />
      ) : (
        <Feather name="bar-chart-2" size={22} color={inactiveColor} />
      );
    case "settings":
      return focused ? (
        <MaterialIcons name="settings" size={22} color={activeColor} />
      ) : (
        <Feather name="settings" size={22} color={inactiveColor} />
      );
    default:
      return (
        <Feather
          name={icon}
          size={22}
          color={focused ? activeColor : inactiveColor}
        />
      );
  }
};

export const CustomTabBarIcon = ({ focused, icon, theme }) => (
  <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
    <View
      style={[
        focused ? styles.filledIconWrapper : null,
        {
          backgroundColor: focused
            ? theme?.colors?.background || "#F5F7FF"
            : "transparent",
        },
      ]}
    >
      {getIconComponent(icon, focused, theme)}
    </View>
  </View>
);

 export function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.card }],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarBackground: () => (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopEndRadius: 30,
              borderTopStartRadius: 30,
              height: "100%",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="home" theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={AddTransaction}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              icon="credit-card"
              theme={theme}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              icon="bar-chart-2"
              theme={theme}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="settings" theme={theme} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator}/>
      <Stack.Screen name="Expense" component={ExpensePage} />
      <Stack.Screen name="Income" component={IncomePage} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 110,
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    position: "absolute",
    right: 20,
    left: 20,
    borderRadius: 30,
    paddingBottom: 0,
    paddingTop: 5,
  },
  filledIconWrapper: {
    backgroundColor: "#F5F7FF",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 2,
  },
  activeIconContainer: {
    backgroundColor: "#F5F7FF",
  },
});
