import React, { useState } from "react";
import { Image, Switch, Text, View } from "react-native";
import { styles } from "../styles/choreCard.styles";
import { AccountChore } from "@/models/chores";
import Avatar from "./Avatar";
import { useAuth } from "@/context/auth";
interface IChoreCard {
  item: AccountChore;
  completeTask: (choreId: string) => void;
}

const ChoreCard = ({ item, completeTask }: IChoreCard) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(
    item.status === "COMPLETED"
  );

  const toggleSwitch = () => {
    setIsEnabled((previousState) => {
      return !previousState;
    });
    completeTask(item.id);
  };

  const isSameOrBefore = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isOverdue = (dueDate: Date): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    // Reset time parts to compare dates only
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <View
      style={[
        styles.listItemShadow,
        isEnabled
          ? styles.listItemComplete
          : isOverdue(new Date(item.dueDate))
          ? styles.listItemOverdue
          : styles.listItemInProgress,
        styles.listItem,
      ]}
    >
      <View style={styles.listItemAvatar}>
        <Avatar size={48} name={item.accountName ?? ""} />
        <Text style={styles.accountName}>{item.accountName}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listItemTitle}>{item.chore.title}</Text>
        <Text style={styles.listItemDescription}>{item.chore.description}</Text>
        <View style={styles.listSubOptions}>
          <Text>{`${
            isEnabled
              ? "Complete"
              : isOverdue(new Date(item.dueDate))
              ? "Overdue"
              : "In Progress"
          }`}</Text>
          <View
            style={
              isEnabled
                ? styles.greenCircle
                : isOverdue(new Date(item.dueDate))
                ? styles.redCircle
                : styles.yellowCircle
            }
          ></View>
        </View>
      </View>
      <Text style={styles.points}>+{item.points}</Text>
      {item.accountId === user?.id && (
        <View style={{ alignSelf: "flex-start", marginTop: 5 }}>
          <Switch
            trackColor={{ false: "rgba(120, 120, 128, 0.16)", true: "#24FF00" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="rgba(120, 120, 128, 0.16)"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      )}
    </View>
  );
};

export default ChoreCard;
