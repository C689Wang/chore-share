import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  useGetAccountNotificationsQuery,
  useMarkNotificationsAsSeenMutation,
} from '@/store/notificationsApi';
import { useAuth } from '@/context/auth';
import { useAppSelector } from '@/store/hooks';
import NotificationCard from './NotificationCard';

const NotificationsModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const [unseenNotifications, setUnseenNotifications] = useState<string[]>([]);
  const [markNotificationsAsSeen] = useMarkNotificationsAsSeenMutation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, refetch } = useGetAccountNotificationsQuery(
    {
      accountId: user?.id ?? '',
      householdId: selectedHouseholdId ?? '',
    },
    {
      skip: !user?.id || !selectedHouseholdId,
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isVisible && unseenNotifications.length > 0) {
      const updateNotifications = async () => {
        try {
          await markNotificationsAsSeen({
            accountId: user?.id ?? '',
            householdId: selectedHouseholdId ?? '',
            notificationIds: unseenNotifications,
          }).unwrap();
        } catch (error) {
          console.error('Failed to mark notifications as seen:', error);
        }
      };

      updateNotifications();
    }
  }, [isVisible, unseenNotifications]);

  const handleNotificationSeen = (accountNotificationId: string) => {
    if (!unseenNotifications.includes(accountNotificationId)) {
      setUnseenNotifications((prev) => [...prev, accountNotificationId]);
    }
  };

  return (
    <Modal visible={isVisible} animationType='slide' onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onSeen={handleNotificationSeen}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFCF4',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
});

export default NotificationsModal;
