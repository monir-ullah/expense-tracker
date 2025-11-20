import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getTransactions } from "../storage/transactionStorage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Screen } from "../styles/Screen";

function calcAnalytics(transactions) {
  let totalIncome = 0,
    totalExpense = 0,
    byCategory = {},
    recent = [];
  transactions.forEach((tx) => {
    const amt =
      typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount);
    if (tx.type === "income") totalIncome += amt;
    else totalExpense += amt;
    const cat = tx.type === "income" ? "Income" : "Expense";
    byCategory[cat] = (byCategory[cat] || 0) + amt;
  });
  recent = transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    byCategory,
    recent,
  };
}

function filterTransactions(transactions, { type, search, dateFrom, dateTo }) {
  return transactions.filter((tx) => {
    if (type !== "all" && tx.type !== type) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(tx.date) > new Date(dateTo)) return false;
    return true;
  });
}

export default function Analytics() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
    byCategory: {},
    recent: [],
  });

  const [filter, setFilter] = useState({
    type: "all",
    search: "",
    dateFrom: null,
    dateTo: null,
  });

  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);

  const typeList = [
    { key: "all", label: "All", color: "#8a88f0" },
    { key: "income", label: "Income", color: "#58c28a" },
    { key: "expense", label: "Expense", color: "#e57373" },
  ];

  const [imageUri, setImageUri] = useState(null);
  const loadImageUri = async () => {
    try {
      const uri = await AsyncStorage.getItem("profileImagePath");
      setImageUri(uri);
    } catch (error) {
      console.error("Error loading image URI:", error);
    }
  };

  // Fetch transactions & filter
  const fetchData = async () => {
    const data = await getTransactions();
    setTransactions(data);
    setAnalytics(calcAnalytics(data));
  };
  useEffect(() => {
    if (isFocused) {
      fetchData();
      loadImageUri();
    }
  }, [isFocused]);
  useEffect(() => {
    const filtered = filterTransactions(transactions, filter);
    setFilteredTransactions(filtered);
    setAnalytics(calcAnalytics(filtered));
  }, [filter, transactions]);

  // Date pretty print for pill
  const formatDateStr = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  // Clear all filters handler
  const clearFilters = () => {
    setFilter({
      type: "all",
      search: "",
      dateFrom: null,
      dateTo: null,
    });
  };

  // --- FIXED: Everything goes inside flex:1 View for FlatList scrolling! ---
  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.headerRow, { marginTop: -35 }]}>
          <Text style={styles.dashboardText}>Analytics</Text>
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Setting")}
              style={styles.avatar}
            >
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Analytics Cards */}
        <View style={[styles.analyticsRow, { marginTop: 2, marginBottom: 25 }]}>
          <View style={[styles.analyticsCard, { borderLeftColor: "#8a88f0" }]}>
            <Text style={styles.analyticsLabel}>Balance</Text>
            <Text
              style={[
                styles.analyticsValue,
                { color: analytics.balance < 0 ? "#d32f2f" : "#8a88f0" },
              ]}
            >
              {analytics.balance?.toLocaleString()} ৳
            </Text>
          </View>

          <View style={[styles.analyticsCard, { borderLeftColor: "#58c28a" }]}>
            <Text style={styles.analyticsLabel}>Income</Text>
            <Text style={[styles.analyticsValue, { color: "#58c28a" }]}>
              {analytics.totalIncome?.toLocaleString()} ৳
            </Text>
          </View>
          <View style={[styles.analyticsCard, { borderLeftColor: "#e57373" }]}>
            <Text style={styles.analyticsLabel}>Expense</Text>
            <Text style={[styles.analyticsValue, { color: "#e57373" }]}>
              {analytics.totalExpense?.toLocaleString()} ৳
            </Text>
          </View>
        </View>
        {/* Filter Row */}
        <View style={[styles.filterRow, { marginTop: -7 }]}>
          <View style={styles.filterPillsRow}>
            {typeList.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.filterPill,
                  filter.type === t.key && {
                    backgroundColor: t.color,
                    elevation: 1,
                  },
                ]}
                onPress={() => setFilter({ ...filter, type: t.key })}
              >
                <Text
                  style={{
                    color: filter.type === t.key ? "#fff" : "#333",
                    fontWeight: "700",
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Clear filter button */}
            <TouchableOpacity
              style={[styles.clearBtn, { marginLeft: 10 }]}
              onPress={clearFilters}
              activeOpacity={0.8}
            >
              <Feather name="x" size={18} color="#fff" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {/* Search */}
          <TextInput
            style={styles.filterInput}
            placeholder="🔍 Search description..."
            value={filter.search}
            onChangeText={(txt) => setFilter({ ...filter, search: txt })}
          />
          {/* Date range */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateChip}
              onPress={() => setShowDateFrom(true)}
            >
              <Feather name="calendar" size={16} color="#8a88f0" />
              <Text style={styles.dateChipText}>
                {filter.dateFrom ? formatDateStr(filter.dateFrom) : "Date from"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateChip}
              onPress={() => setShowDateTo(true)}
            >
              <Feather name="calendar" size={16} color="#8a88f0" />
              <Text style={styles.dateChipText}>
                {filter.dateTo ? formatDateStr(filter.dateTo) : "Date to"}
              </Text>
            </TouchableOpacity>
          </View>
          {showDateFrom && (
            <DateTimePicker
              value={filter.dateFrom ? new Date(filter.dateFrom) : new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDateFrom(false);
                if (date)
                  setFilter((f) => ({
                    ...f,
                    dateFrom: date.toISOString().split("T")[0],
                  }));
              }}
            />
          )}
          {showDateTo && (
            <DateTimePicker
              value={filter.dateTo ? new Date(filter.dateTo) : new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDateTo(false);
                if (date)
                  setFilter((f) => ({
                    ...f,
                    dateTo: date.toISOString().split("T")[0],
                  }));
              }}
            />
          )}
        </View>
        {/* Transactions list */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.txCard}>
              <View
                style={[
                  styles.txIconCircle,
                  {
                    backgroundColor:
                      item.type === "income" ? "#e8f8e8" : "#ffebee",
                  },
                ]}
              >
                <Feather
                  name={item.type === "income" ? "arrow-down" : "arrow-up"}
                  size={20}
                  color={item.type === "income" ? "#58c28a" : "#e57373"}
                />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={styles.txDesc}>{item.description}</Text>
                <Text style={styles.txDate}>
                  {new Date(item.date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  {
                    color: item.type === "income" ? "#58c28a" : "#e57373",
                    fontWeight: "bold",
                  },
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {parseFloat(item.amount).toLocaleString()}৳
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>
              No transactions found.
            </Text>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  dashboardText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 8,
    backgroundColor: "#ddd",
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  analyticsCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 103,
    borderLeftWidth: 5,
    shadowColor: "#8a88f0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.085,
    shadowRadius: 5,
    elevation: 2,
  },
  analyticsLabel: { color: "#888", fontSize: 14, fontWeight: "700" },
  analyticsValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
    marginVertical: 1,
  },
  filterRow: {
    marginHorizontal: 14,
    marginBottom: 14,
  },
  filterPillsRow: { flexDirection: "row", marginBottom: 8 },
  filterPill: {
    backgroundColor: "#eaeaff",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 19,
    marginRight: 7,
    alignItems: "center",
    marginBottom: 2,
  },
  clearBtn: {
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  clearBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14,
  },
  filterInput: {
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 9,
    marginBottom: 7,
    fontSize: 15,
    color: "#222",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e8fd",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 13,
    marginRight: 10,
  },
  dateChipText: { marginLeft: 6, fontWeight: "600", color: "#5756d9" },
  txCard: {
    backgroundColor: "#fff",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginHorizontal: 14,
    marginVertical: 7,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  txIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  txDesc: { fontSize: 16, fontWeight: "700", color: "#222" },
  txDate: { fontSize: 13, color: "#888", marginTop: 2 },
  txAmount: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "right",
    marginLeft: 8,
  },
});
