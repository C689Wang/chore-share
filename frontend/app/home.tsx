import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import { styles } from "../styles/home.styles";
import { householdApi, Household } from "../api/households";

export default function Home() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [householdId, setHouseholdId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (user?.id) {
      loadHouseholds();
    }
  }, [user]);

  const loadHouseholds = async () => {
    try {
      const data = await householdApi.getHouseholds(user!.id);
      setHouseholds(data);
    } catch (err) {
      console.error("Failed to load households:", err);
    }
  };

  const handleJoinHousehold = async () => {
    try {
      await householdApi.joinHousehold({
        householdID: householdId,
        accountID: user.id,
        password: password,
      });

      setJoinDialogVisible(false);
      // Refresh households list
      loadHouseholds();
    } catch (err: any) {
      setError(err.message || "Failed to join household");
    }
  };

  const handleCreateHousehold = async () => {
    try {
      // Add validation
      if (!householdName.trim() || !createPassword.trim()) {
        setError("Household name and password are required");
        return;
      }

      await householdApi.createHousehold(user.id, {
        name: householdName,
        password: createPassword,
      });

      setCreateDialogVisible(false);
      setHouseholdName("");
      setCreatePassword("");
      // Refresh households list
      loadHouseholds();
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

      <ScrollView style={styles.householdList}>
        {households.map((household) => (
          <Pressable
            key={household.id}
            style={styles.householdCard}
            onPress={() => {}}
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
                <Text style={[styles.buttonText, styles.joinButtonText]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
