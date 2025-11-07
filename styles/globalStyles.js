import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#000000',
  secondary: '#666666',
  background: '#ffffff',
  card: '#ffffff',
  success: '#4CAF50',
  danger: '#F44336',
  successLight: '#E8F5E9',
  dangerLight: '#FFEBEE',
  gray: '#f5f5f5',
  grayText: '#666666',
  border: '#f0f0f0'
};

export const shadow = {
  light: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  }
};

export const typography = {
  header: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    fontSize: 12,
    color: '#666',
  }
};

export const layout = {
  padding: 16,
  radius: {
    small: 12,
    medium: 16,
    large: 20,
    circle: 24,
  },
  card: {
    padding: 20,
    margin: 16,
    borderRadius: 16,
  }
};

export const containerStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    marginTop: -30,
  },
  card: {
    backgroundColor: colors.card,
    ...layout.card,
    ...shadow.light,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export const buttonStyles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray,
    borderRadius: layout.radius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export const listStyles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginBottom: 15,
    marginHorizontal: 18,
    borderRadius: layout.radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 90,
    ...shadow.light,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    marginHorizontal: layout.padding,
    marginBottom: 16,
  }
});