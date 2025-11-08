import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Feather } from "@expo/vector-icons";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    return (
      <React.Fragment>
        {this.props.children}
        {/* Show modal only when error exists */}
        <ErrorFallbackModal
          visible={this.state.hasError}
          onReset={this.resetError}
          error={this.state.error}
        />
      </React.Fragment>
    );
  }
}

// Modal fallback component
const ErrorFallbackModal = ({ visible, onReset, error }) => {
  const { theme } = useTheme();

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={modalStyles.backdrop}>
        <View
          style={[modalStyles.content, { backgroundColor: theme.colors.card }]}
        >
          <View
            style={[
              modalStyles.iconContainer,
              { backgroundColor: theme.colors.dangerLight },
            ]}
          >
            <Feather
              name="alert-octagon"
              size={32}
              color={theme.colors.danger}
            />
          </View>
          <Text style={[modalStyles.title, { color: theme.colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[modalStyles.message, { color: theme.colors.muted }]}>
            {error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            style={[
              modalStyles.button,
              {
                backgroundColor: theme.colors.accent,
                flexDirection: "row", // align icon and text horizontally
                alignItems: "center", // center them vertically
                justifyContent: "center",
              },
            ]}
            onPress={onReset}
          >
            <Feather
              name="home"
              size={20}
              color={theme.colors.card}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[modalStyles.buttonText, { color: theme.colors.card }]}
            >
              Go Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Modal styles
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorBoundaryClass;
