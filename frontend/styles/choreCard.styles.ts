import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ECF0EB',
  },
  listItem: {
    padding: 16,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 8,
    borderRadius: 20,
    height: 120,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    position: 'relative',
  },
  listItemShadow: {
    shadowColor: '#212121',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 11,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  listItemDescription: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '400',
  },
  listItemAvatar: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: 5,
    marginRight: 12,
  },
  listSubOptions: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    columnGap: 5,
    width: '100%',
  },
  redCircle: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: '#FA9A9A',
  },
  greenCircle: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: '#B9EAB3',
  },
  yellowCircle: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: '#EDEA9B',
  },
  listItemComplete: {
    backgroundColor: '#F4FFE5',
  },
  listItemInProgress: {
    backgroundColor: '#FFFDEA',
  },
  listItemOverdue: {
    backgroundColor: '#FFF1F1',
  },
  flatListContainer: {
    maxHeight: '100%',
    padding: 15,
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  points: {
    fontSize: 20,
    fontWeight: '600',
    position: 'absolute',
    bottom: 15,
    right: 20,
  },
  listItemPlanned: {
    backgroundColor: '#F5F5F5',
  },
  greyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#808080',
  },
});
