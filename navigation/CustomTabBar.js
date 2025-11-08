import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

export default function CustomTabBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  // Get active tab name automatically
  const getActiveTab = () => {
    // navigation.getState() is most reliable in tab context
    const state = navigation.getState?.();
    if (state?.routes && typeof state.index === "number") {
      return state.routes[state.index]?.name;
    }
    return null;
  }
  const activeTab = getActiveTab();

  return (
    <View style={[
      styles.tabBar,
      { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
    ]}>
      <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: 'Home' })} style={styles.tabItem}>
        <Octicons name="home-fill" size={22} color={activeTab === "Home" ? theme.colors.primary : theme.colors.muted} />
        <Text style={[styles.tabText, { color: activeTab === "Home" ? theme.colors.primary : theme.colors.muted }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: 'Wallet' })} style={styles.tabItem}>
        <Feather name="credit-card" size={22} color={activeTab === "Wallet" ? theme.colors.primary : theme.colors.muted} />
        <Text style={[styles.tabText, { color: activeTab === "Wallet" ? theme.colors.primary : theme.colors.muted }]}>Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: 'Analytics' })} style={styles.tabItem}>
        <Feather name="bar-chart-2" size={22} color={activeTab === "Analytics" ? theme.colors.primary : theme.colors.muted} />
        <Text style={[styles.tabText, { color: activeTab === "Analytics" ? theme.colors.primary : theme.colors.muted }]}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: 'Setting' })} style={styles.tabItem}>
        <Feather name="settings" size={22} color={activeTab === "Setting" ? theme.colors.primary : theme.colors.muted} />
        <Text style={[styles.tabText, { color: activeTab === "Setting" ? theme.colors.primary : theme.colors.muted }]}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 100,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    paddingBottom: 10,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 14,
    zIndex: 101,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
