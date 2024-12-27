import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF4',
    marginTop: 50,
    display: 'flex',
    alignContent: 'center',
  },
  notificationIndicator: {
    borderRadius: 50,
    width: 8,
    height: 8,
    position: 'absolute',
    right: 4,
    top: 14,
    backgroundColor: '#FFFCF4',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFCF4',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationList: {
    paddingBottom: 20,
    marginTop: 10,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 22,
  },
  notificationItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
  },
});
