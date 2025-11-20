import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
} from "../storage/transactionStorage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Screen } from "../styles/Screen";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bdtFormatter, dhakaDateTimeFormatter } from "../assets/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(34567.9);
  const [showBalance, setShowBalance] = useState(true);

  const [imageUri, setImageUri] = useState(null);

  const isFocused = useIsFocused();

  // modal / edit state
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editDate, setEditDate] = useState("");

  // pull data function so we can call it after edits/deletes
  const fetchData = async () => {
    const data = await getTransactions();
    console.log("Loaded transactions:", data);
    setTransactions(data);

    const total = data.reduce((acc, tx) => {
      // Safely convert amount to number, handling edge cases
      let amt = 0;
      try {
        amt = typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount);
        if (!Number.isFinite(amt)) amt = 0;
      } catch (e) {
        console.warn("Invalid amount:", tx.amount);
        amt = 0;
      }
      return tx.type === "income" ? acc + amt : acc - amt;
    }, 0);

    setBalance(total);
  };

  const loadImageUri = async () => {
    try {
      const uri = await AsyncStorage.getItem("profileImagePath");
      console.log("Loaded image URI:", uri);
      if (uri) {
        setImageUri(uri); // Use the string, NOT a File object!
      }
    } catch (error) {
      console.error("Error loading image URI:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
      loadImageUri();
    }
  }, [isFocused]);

  const openModal = (item) => {
    setSelected(item);
    setEditAmount(String(item.amount));
    setEditDescription(item.description || "");
    setEditType(item.type || "expense");
    setEditDate(item.date || new Date().toISOString());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const renderActionButton = (icon, label, path) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => path && navigation.navigate(path)}
    >
      <View style={styles.actionButtonIcon}>
        <Feather name={icon} size={24} color={theme.colors.text} />
      </View>
      <Text style={[styles.actionButtonText, { color: theme.colors.muted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            Dashboard
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  marginLeft: 8,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View
        style={[styles.balanceCard, { backgroundColor: theme.colors.card }]}
      >
        <Text style={styles.balanceLabel}>Account balance</Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
            {showBalance ? bdtFormatter.format(balance) : "****"}
          </Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            <Feather
              name={showBalance ? "eye" : "eye-off"}
              size={24}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.accountNumber, { color: theme.colors.muted }]}>
          1289440585
        </Text>
      </View>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionButtonsContainer,
          { backgroundColor: theme.colors.card },
        ]}
      >
        {renderActionButton("arrow-up", "Expense", "Expense")}
        {renderActionButton("credit-card", "Wallet", "Wallet")}
        {renderActionButton("arrow-down", "Income", "Income")}
        {renderActionButton("more-horizontal", "More", "Setting")}
      </View>

      {/* Transactions Header */}
      <View style={styles.transactionsHeader}>
        <Text style={[styles.transactionsTitle, { color: theme.colors.text }]}>
          Transactions
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, { color: theme.colors.muted }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingBottom: 90, // Add padding for tab bar
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openModal(item)}
            style={({ pressed }) => [
              styles.transactionItem,
              pressed && styles.transactionItemPressed,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.directionIcon,
                  {
                    backgroundColor:
                      item.type === "income"
                        ? theme.colors.accent + "20"
                        : theme.colors.dangerLight,
                  },
                ]}
              >
                <Feather
                  name={item.type === "income" ? "arrow-down" : "arrow-up"}
                  size={20}
                  color={
                    item.type === "income"
                      ? theme.colors.accent
                      : theme.colors.danger
                  }
                />
              </View>
              <View>
                <Text
                  style={[styles.transactionName, { color: theme.colors.text }]}
                >
                  {item.description}
                </Text>
                <Text
                  style={[
                    styles.transactionDate,
                    { color: theme.colors.muted },
                  ]}
                >
                  {dhakaDateTimeFormatter.format(new Date(item.date))}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color:
                    item.type === "income"
                      ? theme.colors.accent
                      : theme.colors.danger,
                },
              ]}
            >
              {bdtFormatter.format(item.amount)}
            </Text>
          </Pressable>
        )}
      />

      {/* Action modal shown when a transaction is pressed */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Feather name="x" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  {selected ? selected.description : ""}
                </Text>
                <Text style={styles.modalAmount}>
                  {selected ? bdtFormatter.format(selected.amount) : ""}
                </Text>

                <TouchableOpacity
                  style={[styles.modalButton, styles.editButton]}
                  onPress={() => {
                    // Navigate to AddTransaction tab in edit mode with the transaction
                    closeModal();
                    navigation.navigate("Wallet", {
                      transaction: selected,
                      edit: true,
                    });
                  }}
                >
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={async () => {
                    // Confirm then delete
                    if (!selected) return;
                    Alert.alert(
                      "Delete",
                      "Are you sure you want to delete this transaction?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteTransaction(selected.id);
                              closeModal();
                              fetchData();
                            } catch (e) {
                              console.error("Delete failed", e);
                              Alert.alert("Delete failed");
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 8,
  },
  balanceCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  accountNumber: {
    color: "#666",
    marginTop: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionButton: {
    alignItems: "center",
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    marginLeft: -8,
    fontWeight: "600",
  },
  seeAllText: {
    color: "#666",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 15,
    marginHorizontal: 18,
    // padding: 20,
    paddingBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 90,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionItemPressed: {
    // subtle pressed feedback: slightly darker background and slight scale
    backgroundColor: "#F5F7FF",
    transform: [{ scale: 0.998 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    marginTop: 8,
  },
  modalDesc: {
    color: "#666",
    marginBottom: 8,
    fontSize: 15,
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#E8F5FF",
  },
  deleteButton: {
    backgroundColor: "#FFECEC",
  },
  cancelButton: {
    backgroundColor: "#F5F5F7",
  },
  modalButtonText: {
    fontWeight: "700",
    color: "#222",
  },
});
