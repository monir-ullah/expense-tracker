import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
} from "../storage/transactionStorage";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { Screen } from "../styles/Screen";
import CustomTabBar from "../navigation/CustomTabBar";

const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
});

export default function ExpensePage() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("expense");
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadTransactions();
  }, [isFocused, type]);

  const loadTransactions = async () => {
    const data = await getTransactions();
    const filteredData = Array.isArray(data)
      ? type === "expense"
        ? data.filter((t) => t.type === "expense")
        : data.filter((t) => t.type === "income")
      : [];
    setTransactions(filteredData);
  };

  // Calculate total for current list shown
  const total = transactions.reduce(
    (sum, t) => (Number.isFinite(+t.amount) ? sum + +t.amount : sum),
    0
  );

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setModalVisible(false);
    loadTransactions();
  };

  const openEditModal = (item) => {
    setSelectedTx(item);
    setEditAmount(item.amount ? String(item.amount) : "");
    setEditDescription(item.description || "");
    setEditType(item.type); // Set the initial type for editing
    setModalVisible(true);
  };

  const handleEdit = async () => {
    if (!selectedTx) return;
    const amt = parseFloat(editAmount);
    if (!Number.isFinite(amt)) return Alert.alert("Enter a valid amount");
    try {
      await updateTransaction({
        ...selectedTx,
        amount: amt,
        description: editDescription,
        type: editType,
      });
      setModalVisible(false);
      loadTransactions();
    } catch (e) {
      Alert.alert("Update failed");
    }
  };

  const styles = createStyles(theme);

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor:
                item.type === "income"
                  ? theme.colors.accent + "15"
                  : theme.colors.dangerLight,
            },
          ]}
        >
          <Feather
            name={item.type === "income" ? "arrow-down" : "arrow-up"}
            size={20}
            color={
              item.type === "income" ? theme.colors.accent : theme.colors.danger
            }
          />
        </View>
        <View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.description || "No description"}
          </Text>
          <Text style={styles.cardSub}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.cardAmount,
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
    </TouchableOpacity>
  );

  // Modal content for edit/delete/type switch
  const renderEditModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={20} color={theme.colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {/* Inputs */}
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Description"
            />
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={editAmount}
              onChangeText={setEditAmount}
              placeholder="Amount"
            />

            {/* Expnse, Income Switch */}
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      editType === "expense"
                        ? theme.colors.dangerLight
                        : theme.colors.card,
                  },
                ]}
                onPress={() => setEditType("expense")}
              >
                <Feather
                  name="arrow-up"
                  size={20}
                  color={
                    editType === "expense"
                      ? theme.colors.danger
                      : theme.colors.muted
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        editType === "expense"
                          ? theme.colors.danger
                          : theme.colors.muted,
                    },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      editType === "income"
                        ? theme.colors.accent + "20"
                        : theme.colors.card,
                  },
                ]}
                onPress={() => setEditType("income")}
              >
                <Feather
                  name="arrow-down"
                  size={20}
                  color={
                    editType === "income"
                      ? theme.colors.accent
                      : theme.colors.muted
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        editType === "income"
                          ? theme.colors.accent
                          : theme.colors.muted,
                    },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons - save, delete, cancel */}
            <TouchableOpacity
              style={[styles.modalButton, styles.editBtn]}
              onPress={handleEdit}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteBtn]}
              onPress={() => handleDelete(selectedTx.id)}
            >
              <Text
                style={[styles.modalButtonText, { color: theme.colors.danger }]}
              >
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelBtn]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header + total */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackIcon}
          >
            <Feather name="arrow-left" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === "expense" ? "Expenses" : "Income"}
          </Text>
          <Text style={styles.totalText}>
            {type === "expense" ? "Total Expense" : "Total Income"}:{" "}
            {bdtFormatter.format(total)}
          </Text>
        </View>
        {/* List filter type selector */}
        <View style={styles.typeSelectorTop}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  type === "expense"
                    ? theme.colors.dangerLight
                    : theme.colors.card,
              },
            ]}
            onPress={() => setType("expense")}
          >
            <Feather
              name="arrow-up"
              size={20}
              color={
                type === "expense" ? theme.colors.danger : theme.colors.muted
              }
            />
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    type === "expense"
                      ? theme.colors.danger
                      : theme.colors.muted,
                },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  type === "income"
                    ? theme.colors.accent + "20"
                    : theme.colors.card,
              },
            ]}
            onPress={() => setType("income")}
          >
            <Feather
              name="arrow-down"
              size={20}
              color={
                type === "income" ? theme.colors.accent : theme.colors.muted
              }
            />
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    type === "income"
                      ? theme.colors.accent
                      : theme.colors.muted,
                },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
        {/* List */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="file-text" size={42} color={theme.colors.muted} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
        {/* Modal */}
        {renderEditModal()}
      </View>

      <CustomTabBar  />
    </Screen>
  );
}

// --- Dynamic theme styles (like dashboard) ---
function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingTop: -20,
    },
    header: {
      marginTop: -30,
      marginBottom: 12,
    },
    headerBackIcon: {
      position: "absolute",
      left: 0,
      top: 2,
      zIndex: 1,
      padding: 6,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      alignSelf: "center",
      marginBottom: 2,
    },
    totalText: {
      fontSize: 14,
      color: theme.colors.muted,
      alignSelf: "center",
      marginBottom: 8,
    },
    typeSelectorTop: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 12,
    },
    typeSelector: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
      marginTop: 6,
    },
    typeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 9,
      paddingHorizontal: 24,
      borderRadius: 22,
      marginHorizontal: 7,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    typeButtonText: {
      fontSize: 15,
      fontWeight: "600",
      marginLeft: 8,
    },
    card: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      marginBottom: 14,
      padding: 18,
      borderRadius: 14,
      elevation: 3,
      shadowColor: "#333",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
    },
    cardLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
    },
    iconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
      maxWidth: 120,
    },
    cardSub: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    cardAmount: {
      fontSize: 16,
      fontWeight: "700",
    },
    emptyState: {
      alignItems: "center",
      marginTop: 60,
    },
    emptyText: {
      fontSize: 15,
      color: theme.colors.muted,
      marginTop: 8,
    },
    // --- Modal styles ---
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalCard: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: theme.colors.card,
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
      color: theme.colors.text,
    },
    modalBody: {
      marginTop: 8,
    },
    modalLabel: {
      fontSize: 14,
      color: theme.colors.muted,
      marginBottom: 4,
      fontWeight: "500",
    },
    modalInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    modalButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 12,
      backgroundColor: theme.colors.background,
    },
    editBtn: {
      backgroundColor: theme.colors.accent,
    },
    deleteBtn: {
      backgroundColor: "#FFECEC",
    },
    cancelBtn: {
      backgroundColor: theme.colors.background,
    },
    modalButtonText: {
      fontWeight: "700",
      color: theme.colors.text,
    },
  });
}
