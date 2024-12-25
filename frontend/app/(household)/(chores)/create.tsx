import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { styles } from "../../../styles/create.styles";
import { useGetHouseholdMembersQuery } from "../../../store/householdsApi";
import Avatar from "@/components/Avatar";
import { useAppSelector } from "@/store/hooks";
import { useCreateChoreMutation } from "@/store/choresApi";
import { CreateChoreParams, ChoreType, FrequencyType } from "@/models/chores";
import { router } from "expo-router";
import { useAuth } from "@/context/auth";

interface Weekday {
  name: string;
  selected: boolean;
}

export default function Create() {
  const { user } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedRotation, setSelectedRotation] = useState<string[]>([]);
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );

  const dispatch = useDispatch();

  const initialWeekdays: Weekday[] = [
    { name: "Sun", selected: false },
    { name: "Mon", selected: false },
    { name: "Tues", selected: false },
    { name: "Wed", selected: false },
    { name: "Thurs", selected: false },
    { name: "Fri", selected: false },
    { name: "Sat", selected: false },
  ];
  const [weekdays, setWeekdays] = useState<Weekday[]>(initialWeekdays);
  const [points, setPoints] = useState(25);
  const [emoji, setEmoji] = useState<string>("");

  const { data: members, isLoading: membersLoading } =
    useGetHouseholdMembersQuery(selectedHouseholdId ?? "");

  const [createChore, { isLoading: isCreating }] = useCreateChoreMutation();

  const handleEmojiInputChange = (text: string) => {
    const isEmojiOnly = (str: string) => {
      const regexExp =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
      return regexExp.test(str);
    };
    if (text.length < 2 || isEmojiOnly(text)) {
      setEmoji(text);
    } else {
      Alert.alert("Please enter only one emoji.");
    }
  };

  const toggleWeekday = (index: number) => {
    let newWeekdays = [...weekdays];
    newWeekdays[index].selected = !newWeekdays[index].selected;
    setWeekdays(newWeekdays);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const toggleAssigneeSelection = (userId: string) => {
    if (isRepeated) {
      setSelectedRotation((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedAssignee(selectedAssignee === userId ? null : userId);
    }
  };

  const handleCreate = async () => {
    if (!selectedHouseholdId) {
      Alert.alert("Error", "No household selected");
      return;
    }

    if (!title) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (isRepeated && !weekdays.some((day) => day.selected)) {
      Alert.alert(
        "Error",
        "Please select at least one day for recurring chore"
      );
      return;
    }

    if (!isRepeated && !selectedAssignee) {
      Alert.alert("Error", "Please select an assignee");
      return;
    }

    if (isRepeated && selectedRotation.length === 0) {
      Alert.alert("Error", "Please select at least one person for rotation");
      return;
    }

    try {
      const params: CreateChoreParams = {
        title,
        description,
        type: isRepeated
          ? ("RECURRING" as ChoreType)
          : ("ONE_TIME" as ChoreType),
        assigneeIds: isRepeated ? selectedRotation : [selectedAssignee!],
      };

      if (isRepeated) {
        params.endDate = dueDate;
        params.frequency = "WEEKLY" as FrequencyType;
        params.schedule = weekdays
          .map((day, index) => (day.selected ? (index + 1) % 7 || 7 : 0))
          .filter((day) => day !== 0);
      } else {
        params.endDate = dueDate;
      }

      await createChore({
        accountId: user?.id || "",
        householdId: selectedHouseholdId,
        params,
      }).unwrap();

      Alert.alert("Success", "Chore created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create chore");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.emojiInputContainer}>
          <MaterialIcons
            name="image"
            size={24}
            color="black"
            style={{ alignSelf: "center" }}
          />
          <TextInput
            placeholder="Add Icon"
            value={emoji}
            onChangeText={handleEmojiInputChange}
            style={{
              fontSize: 15,
              borderBottomWidth: 0,
              borderColor: "transparent",
              marginLeft: 8,
              flex: 1,
            }}
          />
        </View>
        {/* Input for Chore Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Chore Title"
          placeholderTextColor="black"
          onChangeText={(text) => setTitle(text)}
          value={title}
        />
        <View>
          <Text style={styles.label}>Description</Text>
          {/* Input for Chore Description */}
          <TextInput
            placeholder="Insert description here"
            placeholderTextColor="#ccc"
            onChangeText={(text) => setDescription(text)}
            value={description}
            style={styles.descriptionInput}
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Repeated Chore</Text>
          <Switch
            value={isRepeated}
            onValueChange={setIsRepeated}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
          />
        </View>

        {isRepeated ? (
          <>
            <Text style={styles.label}>Select day(s)</Text>
            <View style={styles.weekdayContainer}>
              {weekdays.map((weekday, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.weekdayButton,
                    weekday.selected ? styles.weekdayButtonSelected : null,
                  ]}
                  onPress={() => toggleWeekday(index)}
                >
                  <Text
                    style={[
                      styles.weekdayText,
                      weekday.selected ? styles.weekdayTextSelected : null,
                    ]}
                  >
                    {weekday.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Rotation Order</Text>
            <View style={styles.assigneeContainer}>
              {members?.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.assigneeButton,
                    selectedRotation.includes(user.id) &&
                      styles.assigneeButtonSelected,
                  ]}
                  onPress={() => toggleAssigneeSelection(user.id)}
                >
                  <Avatar name={user.name} size={24} />
                  <Text style={styles.assigneeName}>{user.name}</Text>
                  {selectedRotation.includes(user.id) && (
                    <View style={styles.rotationOrder}>
                      <Text style={styles.rotationOrderText}>
                        {selectedRotation.indexOf(user.id) + 1}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Assign To</Text>
            <View style={styles.assigneeContainer}>
              {members?.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.assigneeButton,
                    selectedAssignee === user.id &&
                      styles.assigneeButtonSelected,
                  ]}
                  onPress={() => toggleAssigneeSelection(user.id)}
                >
                  <Avatar name={user.name} size={24} />
                  <Text style={styles.assigneeName}>{user.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showDatePickerModal}
          >
            <MaterialIcons name="event" size={24} color="black" />
            <Text style={styles.dateText}>{dueDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {Platform.OS === "ios" ? (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )
          )}
        </View>
        <Text style={styles.label}>Difficulty Level</Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            columnGap: 18,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            style={[
              styles.listItem,
              styles.listItemShadow,
              points === 25 ? styles.backgroundSelected : null,
            ]}
            onPress={() => {
              setPoints(25);
            }}
          >
            <Text style={styles.listItemTitle}>Easy</Text>
            <Text style={styles.listItemPoints}>+25</Text>
            <Text style={styles.listItemText}>points</Text>
            <View style={styles.checkmarkIcon}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={points === 25 ? "#4CAF50" : "transparent"}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.listItem,
              styles.listItemShadow,
              points === 50 ? styles.backgroundSelected : null,
            ]}
            onPress={() => {
              setPoints(50);
            }}
          >
            <Text style={styles.listItemTitle}>Medium</Text>
            <Text style={styles.listItemPoints}>+50</Text>
            <Text style={styles.listItemText}>points</Text>
            <View style={styles.checkmarkIcon}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={points === 50 ? "#4CAF50" : "transparent"}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.listItem,
              styles.listItemShadow,
              points === 100 ? styles.backgroundSelected : null,
            ]}
            onPress={() => {
              setPoints(100);
            }}
          >
            <Text style={styles.listItemTitle}>Hard</Text>
            <Text style={styles.listItemPoints}>+100</Text>
            <Text style={styles.listItemText}>points</Text>
            <View style={styles.checkmarkIcon}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={points === 100 ? "#4CAF50" : "transparent"}
              />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.createButton,
            (isCreating || !title) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isCreating || !title}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? "Creating..." : "Create"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
