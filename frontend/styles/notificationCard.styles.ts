import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    marginVertical: 2,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 8,
  },
  textCol: {
    flex: 1,
    marginRight: 8,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  textName: {
    fontWeight: '600',
    fontSize: 14,
  },
  textAction: {
    fontSize: 14,
    marginLeft: 4,
  },
  textChore: {
    fontSize: 14,
    marginTop: 2,
    color: '#666',
    fontWeight: '600',
  },
  textDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  buttonContainer: {
    justifyContent: 'center',
    minWidth: 70,
  },
  actionButton: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
