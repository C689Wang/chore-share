import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  owedTransaction: {
    borderLeftColor: '#4CAF50',  // Green for money you're owed
  },
  owingTransaction: {
    borderLeftColor: '#FF5252',  // Red for money you owe
  },
  settledTransaction: {
    borderLeftColor: '#A5D6A7',  // Lighter green for settled transactions
    backgroundColor: '#F5F5F5',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  owedAmount: {
    color: '#4CAF50',
  },
  owingAmount: {
    color: '#FF5252',
  },
  settledAmount: {
    color: '#A5D6A7',
  },
  transactionDetail: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  settleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  settleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  settledText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
  },
});
