import { useAuth } from '@/context/auth';
import { useAppSelector } from '@/store/hooks';
import { useGetAccountNotificationsQuery } from '@/store/notificationsApi';
import { styles } from '@/styles/notificationsModal.styles';
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import NotificationCard from './NotificationCard';
import { useUnseenNotifications } from '@/hooks/useUnseenNotifications';

interface NotificationsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const [refreshing, setRefreshing] = useState(false);
  const { hasUnseen } = useUnseenNotifications();

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useGetAccountNotificationsQuery({
    accountId: user?.id ?? '',
    householdId: selectedHouseholdId ?? '',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const showIndicator = notifications?.some(
    (notification) => !notification.seen
  );

  return (
    <>
      {hasUnseen && <View style={styles.notificationIndicator} />}
      <Modal
        animationType='slide'
        transparent={true}
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <StatusBar translucent backgroundColor='transparent' />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.notificationList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationsModal;
