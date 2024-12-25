import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import { styles } from "../styles/home.styles";
import {
  useGetHouseholdsQuery,
  useJoinHouseholdMutation,
  useCreateHouseholdMutation,
} from "../store/householdsApi";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedHousehold } from "../store/householdsSlice";
import { router } from "expo-router";

export default function Home() {
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [householdId, setHouseholdId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: households,
    isLoading,
    error: fetchError,
    refetch,
  } = useGetHouseholdsQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [joinHousehold] = useJoinHouseholdMutation();
  const [createHousehold] = useCreateHouseholdMutation();

  if (!user) {
    return null;
  }

  const handleJoinHousehold = async () => {
    try {
      await joinHousehold({
        householdID: householdId,
        accountID: user!.id,
        password: password,
      }).unwrap();

      setJoinDialogVisible(false);
    } catch (err: any) {
      setError(err.message || "Failed to join household");
    }
  };

  const handleCreateHousehold = async () => {
    try {
      if (!householdName.trim() || !createPassword.trim()) {
        setError("Household name and password are required");
        return;
      }

      const household = await createHousehold({
        accountId: user!.id,
        params: {
          name: householdName,
          password: createPassword,
        },
      }).unwrap();

      setCreateDialogVisible(false);
      setHouseholdName("");
      setCreatePassword("");
      dispatch(setSelectedHousehold(household.id))
      router.push(`/household`);
    } catch (err: any) {
      setError(err.message || "Failed to create household");
    }
  };

  const handleCancelJoin = () => {
    setJoinDialogVisible(false);
    setHouseholdId("");
    setPassword("");
    setError("");
  };

  const handleCancelCreate = () => {
    setCreateDialogVisible(false);
    setHouseholdName("");
    setCreatePassword("");
    setError("");
  };

  const handleHouseholdSelect = (householdId: string) => {
    dispatch(setSelectedHousehold(householdId));
    router.push(`/household`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Households</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={[styles.addButton, styles.joinButton]}
            onPress={() => setJoinDialogVisible(true)}
          >
            <MaterialIcons name="group-add" size={24} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.addButton, styles.createButton]}
            onPress={() => setCreateDialogVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.householdList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D2D7D3"
          />
        }
      >
        {households?.map((household) => (
          <Pressable
            key={household.id}
            style={styles.householdCard}
            onPress={() => handleHouseholdSelect(household.id)}
          >
            <View style={styles.householdInfo}>
              <Text style={styles.householdName}>{household.name}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={joinDialogVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJoinDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join a Household</Text>

            <TextInput
              style={styles.input}
              placeholder="Household ID"
              value={householdId}
              onChangeText={setHouseholdId}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelJoin}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.joinButton]}
                onPress={handleJoinHousehold}
              >
                <Text style={[styles.buttonText, styles.joinButtonText]}>
                  Join
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={createDialogVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a Household</Text>
            <TextInput
              style={styles.input}
              placeholder="Household Name"
              value={householdName}
              onChangeText={setHouseholdName}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={createPassword}
              onChangeText={setCreatePassword}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelCreate}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.joinButton]}
                onPress={handleCreateHousehold}
              >
                <Text style={[styles.buttonText, styles.joinButtonText]}>
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
