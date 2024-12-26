import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { AccountChore, AssignmentStatus } from '../models/chores';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles/horizontalList.styles';

interface IHorizontalList {
  items: AccountChore[];
}

const HorizontalList = ({ items }: IHorizontalList) => {
  const getBackgroundStyle = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.COMPLETED:
        return styles.backgroundCompleted;
      case AssignmentStatus.PLANNED:
        return styles.backgroundPlanned;
      default:
        return styles.backgroundInProgress;
    }
  };

  const getStatusText = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.COMPLETED:
        return 'Complete';
      case AssignmentStatus.PLANNED:
        return 'Planned';
      default:
        return 'In progress';
    }
  };

  return (
    <View style={[styles.container, styles.listItemShadow]}>
      <Text style={styles.title}>My Chores</Text>
      <FlatList
        style={styles.flatListContainer}
        data={items}
        horizontal={true}
        keyExtractor={({ id }) => id}
        ItemSeparatorComponent={() => <View style={{ width: 25 }} />}
        renderItem={({ item }) => (
          <View
            style={[
              styles.listItem,
              styles.listItemShadow,
              getBackgroundStyle(item.status),
            ]}
          >
            <Text style={styles.listItemTitle}>{item.chore.title}</Text>
            <View style={styles.listSubOptions}>
              <Text>{getStatusText(item.status)}</Text>
              {item.status === AssignmentStatus.COMPLETED ? (
                <View style={styles.greenCircle}></View>
              ) : item.status === AssignmentStatus.PLANNED ? (
                <View style={styles.greyCircle}></View>
              ) : (
                <View style={styles.yellowCircle}></View>
              )}
            </View>
            {item.status === AssignmentStatus.PLANNED && (
              <View style={styles.lockIcon}>
                <MaterialIcons name='lock-clock' size={20} color='#808080' />
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default HorizontalList;
