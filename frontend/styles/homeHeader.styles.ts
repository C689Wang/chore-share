import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 26,
    paddingHorizontal: 10,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginRight: 'auto',
    gap: 10,
  },
  headerMessage: {
    color: 'black',
    marginRight: 'auto',
    fontSize: 12,
    marginTop: 6,
  },
  headerName: {
    fontSize: 15,
    color: 'black',
    marginRight: 'auto',
    fontWeight: 'bold',
  },
  headerImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 4,
  },
  headerNotifications: {
    marginLeft: 'auto',
    marginRight: 10,
  },
});
