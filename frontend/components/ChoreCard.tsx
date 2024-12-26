import { useAuth } from "@/context/auth";
import { AccountChore, AssignmentStatus } from "@/models/chores";
import { useToggleChoreCompletionMutation } from "@/store/choresApi";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { styles } from "../styles/choreCard.styles";
import Avatar from "./Avatar";

interface IChoreCard {
  item: AccountChore;
}

const ChoreCard = ({ item }: IChoreCard) => {
  const { user } = useAuth();
  const [toggleChoreCompletion] = useToggleChoreCompletionMutation();
  const [localCompleted, setLocalCompleted] = useState(item.status === AssignmentStatus.COMPLETED);
  const isCompleted = item.status === AssignmentStatus.COMPLETED;
  const isPlanned = item.status === AssignmentStatus.PLANNED;

  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const isOverdue = (dueDate: Date): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    // Reset time parts to compare dates only
    today.setUTCHours(0, 0, 0, 0);
    due.setUTCHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  };

  const toggleSwitch = () => {
    setLocalCompleted(!localCompleted);
    toggleChoreCompletion({
      accountId: user?.id || "",
      householdId: item.chore.householdId,
      choreId: item.id,
    });
  };

  return (
    <View
      style={[
        styles.listItemShadow,
        localCompleted
          ? styles.listItemComplete
          : isPlanned
          ? styles.listItemPlanned
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
            localCompleted
              ? "Complete"
              : isPlanned
              ? "Planned"
              : isOverdue(new Date(item.dueDate))
              ? "Overdue"
              : "In Progress"
          }`}</Text>
          <View
            style={
              localCompleted
                ? styles.greenCircle
                : isPlanned
                ? styles.greyCircle
                : isOverdue(new Date(item.dueDate))
                ? styles.redCircle
                : styles.yellowCircle
            }
          ></View>
        </View>
      </View>
      <Text style={styles.points}>+{item.points}</Text>
      {item.accountId === user?.id && !isPlanned ? (
        <View style={{ alignSelf: "flex-start", marginTop: 5 }}>
          <Switch
            trackColor={{ false: "rgba(120, 120, 128, 0.16)", true: "#24FF00" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="rgba(120, 120, 128, 0.16)"
            onValueChange={toggleSwitch}
            value={localCompleted}
            disabled={item.status === AssignmentStatus.COMPLETED}
          />
        </View>
      ) : isPlanned ? (
        <View style={{ alignSelf: "flex-start", marginTop: 5 }}>
          <MaterialIcons name="lock-clock" size={24} color="#808080" />
        </View>
      ) : null}
    </View>
  );
};

export default ChoreCard;
