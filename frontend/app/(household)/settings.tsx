import { useAuth } from '@/context/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearSelectedHousehold } from '@/store/householdsSlice';
import { useGetHouseholdsQuery } from '@/store/householdsApi';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { styles } from '@/styles/settings.styles';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );

  const { data: households } = useGetHouseholdsQuery(user?.id ?? '');

  const handleSignOut = async () => {
    dispatch(clearSelectedHousehold());
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Household</Text>
          <View style={styles.householdInfo}>
            <Text style={styles.householdName}>
              {households?.find((h) => h.id === selectedHouseholdId)?.name ||
                'No household selected'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              dispatch(clearSelectedHousehold());
              router.replace('/home');
            }}
          >
            <MaterialIcons name='swap-horiz' size={24} color='#4CAF50' />
            <Text style={styles.switchButtonText}>Switch Household</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <MaterialIcons name='logout' size={24} color='#FF5252' />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
