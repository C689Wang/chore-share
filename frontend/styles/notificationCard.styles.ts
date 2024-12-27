import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  avatar: {
    marginRight: 8,
  },
  container: {
    height: 70,
    width: 325,
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 8,
  },
  textName: {
    fontWeight: '900',
  },
  textAction: {},
  textChore: {
    fontWeight: '700',
  },
  textRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  textCol: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 5,
  },
  textDate: {
    fontSize: 12,
  },
  reviewButton: {
    display: 'flex',
    color: 'blue',
    fontSize: 15,
    position: 'absolute',
    top: 5,
    right: 0,
  },
});
