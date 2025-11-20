import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Screen } from "../styles/Screen";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ProfileImage from "../components/ProfileImage";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme.mode === "dark");
  const anim = useRef(
    new Animated.Value(theme.mode === "dark" ? 1 : 0)
  ).current;

  useEffect(() => {
    const dark = theme.mode === "dark";
    setIsDark(dark);
    Animated.timing(anim, {
      toValue: dark ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [theme.mode]);

  const knobTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 27],
  });
  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#EAEAFF", "#374151"],
  });

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <View style={styles.sectionList}>
        {/* --- Appearance Card --- */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.colors.muted }]}>
            Appearance
          </Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.muted }]}>
                Use dark colors for night viewing
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
              <Animated.View
                style={[styles.switchTrack, { backgroundColor: trackColor }]}
              >
                <Animated.View
                  style={[
                    styles.switchKnob,
                    { transform: [{ translateX: knobTranslate }] },
                  ]}
                >
                  <Feather
                    name={isDark ? "moon" : "sun"}
                    size={16}
                    color={isDark ? "#fff" : "#F6A623"}
                  />
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Account Card --- */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.colors.muted }]}>
            Account
          </Text>
          <TouchableOpacity style={styles.row}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather
                name="user"
                size={22}
                color={theme.colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Profile
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={24}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        </View>

        {/* --- Profile Image Card --- */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.colors.muted }]}>
            Profile Image
          </Text>
          <View style={styles.profileImageRow}>
            <ProfileImage size={52} borderWidth={2} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  sectionList: {
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#4747bd",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    opacity: 0.85,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.95,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 2,
  },
  profileImageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  switchTrack: {
    width: 50,
    height: 26,
    borderRadius: 15,
    padding: 3,
    justifyContent: "center",
    backgroundColor: "#EAEAFF",
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7d7dfa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
});
