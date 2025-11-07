import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { saveTransaction, updateTransaction } from "../storage/transactionStorage";
import { Screen } from "../styles/Screen";
import { Feather } from "@expo/vector-icons";
import { colors, layout } from "../styles/globalStyles";
import { useTheme } from '../context/ThemeContext';

export default function AddTransaction({ navigation, route }) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [type, setType] = useState("expense");

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const onSave = async () => {
    // Validate amount
    if (!amount || isNaN(amount)) {
      Alert.alert("Please enter a valid amount");
      return;
    }

    // Validate description (required)
    if (!description || description.trim() === "") {
      Alert.alert("Please enter a description");
      return;
    }

    const transactionData = {
      id: route?.params?.edit && route?.params?.transaction?.id ? route.params.transaction.id : Date.now(),
      amount: parseFloat(amount),
      description,
      date: date.toISOString(),
      type,
    };

    try {
      if (route?.params?.edit) {
        await updateTransaction(transactionData);
        Alert.alert("Success", "Transaction updated successfully!");
      } else {
        await saveTransaction(transactionData);
        Alert.alert("Success", "Transaction added successfully!");
      }

      setAmount("");
      setDescription("");
      setDate(new Date());
      setType("expense");

      // Navigate back to Home after save/update
      navigation.navigate("Home");
    } catch (e) {
      console.error("Failed to save/update transaction", e);
      Alert.alert("Error", "Failed to save/update transaction");
    }
  };

  // If route params contain a transaction for editing, prefill the form
  useEffect(() => {
    if (route?.params?.edit && route?.params?.transaction) {
      const t = route.params.transaction;
      setAmount(String(t.amount));
      setDescription(t.description || '');
      setDate(t.date ? new Date(t.date) : new Date());
      setType(t.type || 'expense');
    }
  }, [route?.params]);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Transaction</Text>

        <TouchableOpacity onPress={onSave}>
          <Feather name="check" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { backgroundColor: type === "expense" ? theme.colors.dangerLight : theme.colors.card },
          ]}
          onPress={() => setType("expense")}
        >
          <Feather
            name="arrow-up"
            size={20}
            color={type === "expense" ? theme.colors.danger : theme.colors.muted}
          />
          <Text
            style={[
              styles.typeButtonText,
              { color: type === "expense" ? theme.colors.danger : theme.colors.muted },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            { backgroundColor: type === "income" ? theme.colors.accent + '20' : theme.colors.card },
          ]}
          onPress={() => setType("income")}
        >
          <Feather
            name="arrow-down"
            size={20}
            color={type === "income" ? theme.colors.accent : theme.colors.muted}
          />
          <Text
            style={[
              styles.typeButtonText,
              { color: type === "income" ? theme.colors.accent : theme.colors.muted },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Amount</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={theme.colors.muted}
          value={amount}
          onChangeText={setAmount}
          style={[styles.amountInput, { color: theme.colors.text }]}
        />
      </View>

      {/* Description Input */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Description</Text>
        <TextInput
          placeholder="What's this transaction for?"
          placeholderTextColor={theme.colors.muted}
          value={description}
          onChangeText={setDescription}
          style={[styles.descriptionInput, { color: theme.colors.text }]}
          multiline
        />
      </View>

      {/* Date Picker */}
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => setShowPicker(true)}>
        <Text style={[styles.label, { color: theme.colors.muted }]}>Date & Time</Text>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={20} color={theme.colors.muted} />
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Save Button */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={onSave}>
        <Text style={[styles.saveButtonText, { color: theme.colors.card }]}>Save Transaction</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: -30
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    width: "48%",
    justifyContent: "center",
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingLeft: 16,
    paddingTop: 16,
    borderRadius: 16,
    margin: 16,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "600",
    padding: 0,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 0,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
