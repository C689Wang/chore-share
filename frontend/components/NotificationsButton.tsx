import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationsModal from './NotificationsModal';
import NotificationBadge from './NotificationBadge';

interface NotificationsButtonProps {
  onPress: () => void;
}

const NotificationsButton: React.FC<NotificationsButtonProps> = ({
  onPress,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <NotificationBadge>
          <Ionicons name='notifications-outline' size={24} color='black' />
        </NotificationBadge>
      </TouchableOpacity>

      <NotificationsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default NotificationsButton;
