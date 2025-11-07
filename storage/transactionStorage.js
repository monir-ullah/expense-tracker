// Try to use expo-sqlite if available; otherwise fall back to AsyncStorage so the app
// can run while the native module is being installed.
let useSQLite = false;
let db = null;
let SQLite = null;
try {
  // require instead of import so resolution failure can be caught at runtime
  SQLite = require('expo-sqlite');
  db = SQLite.openDatabase('transactions.db');
  useSQLite = true;
} catch (e) {
  console.warn('expo-sqlite not available, falling back to AsyncStorage. Install expo-sqlite and restart the bundler to use SQLite.');
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'transactions';

// SQLite implementation
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!useSQLite) return resolve();
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          type TEXT NOT NULL
        )`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

initDB().catch(error => console.error('Database initialization failed:', error));

// Exported functions: saveTransaction, getTransactions, deleteTransaction, updateTransaction,
// getTransactionById, getBalance

export const saveTransaction = async (transaction) => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO transactions (amount, description, date, type) VALUES (?, ?, ?, ?)',
          [transaction.amount, transaction.description || '', transaction.date, transaction.type],
          (_, result) => resolve({ ...transaction, id: result.insertId || transaction.id }),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Fallback: AsyncStorage
  try {
    const currentData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = currentData ? JSON.parse(currentData) : [];
    const toSave = { ...transaction };
    transactions.unshift(toSave);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return toSave;
  } catch (e) {
    console.error('Saving transaction failed', e);
    throw e;
  }
};

export const getTransactions = async () => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions ORDER BY date DESC',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Fallback: AsyncStorage
  try {
    const currentData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return currentData ? JSON.parse(currentData) : [];
  } catch (e) {
    console.error('Get transactions failed', e);
    return [];
  }
};

export const deleteTransaction = async (id) => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM transactions WHERE id = ?', [id], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  try {
    const currentData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = currentData ? JSON.parse(currentData) : [];
    const filtered = transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
    return;
  } catch (e) {
    throw e;
  }
};

export const updateTransaction = async (transaction) => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE transactions SET amount = ?, description = ?, date = ?, type = ? WHERE id = ?',
          [transaction.amount, transaction.description || '', transaction.date, transaction.type, transaction.id],
          () => resolve(transaction),
          (_, error) => reject(error)
        );
      });
    });
  }

  try {
    const currentData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = currentData ? JSON.parse(currentData) : [];
    const updated = transactions.map(t => (t.id === transaction.id ? transaction : t));
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    return transaction;
  } catch (e) {
    throw e;
  }
};

export const getTransactionById = async (id) => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM transactions WHERE id = ?', [id], (_, { rows }) => resolve(rows._array[0] || null), (_, error) => reject(error));
      });
    });
  }

  try {
    const currentData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = currentData ? JSON.parse(currentData) : [];
    return transactions.find(t => t.id === id) || null;
  } catch (e) {
    throw e;
  }
};



export const getBalance = async () => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance FROM transactions`,
          [],
          (_, { rows }) => resolve(rows._array[0]?.balance || 0),
          (_, error) => reject(error)
        );
      });
    });
  }

  try {
    const transactions = await getTransactions();
    const total = transactions.reduce((acc, tx) => {
      const amt = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount);
      if (!Number.isFinite(amt)) return acc;
      return tx.type === 'income' ? acc + amt : acc - amt;
    }, 0);
    return total;
  } catch (e) {
    console.error(e);
    return 0;
  }
};
