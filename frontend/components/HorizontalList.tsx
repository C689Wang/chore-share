import React from "react";
import { FlatList, Text, View } from "react-native";
import { AccountChore } from "../models/chores";
import { styles } from "../styles/horizontalList.styles";

interface IHorizontalList {
  items: AccountChore[];
}

const HorizontalList = ({ items }: IHorizontalList) => {
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
              item?.completed
                ? styles.backgroundCompleted
                : styles.backgroundInProgress,
            ]}
          >
            <Text style={styles.listItemTitle}>{item.chore.title}</Text>
            {/* <Text style={styles.listItemIcon}>{item.icon}</Text> */}
            <View style={styles.listSubOptions}>
              <Text>{item.completed ? "Complete" : "In progress"}</Text>
              {item.completed ? (
                <View style={styles.greenCircle}></View>
              ) : (
                <View style={styles.yellowCircle}></View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default HorizontalList;
