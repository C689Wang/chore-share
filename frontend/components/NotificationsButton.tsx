import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationBadge from './NotificationBadge';

interface NotificationsButtonProps {
  onPress: () => void;
}

const NotificationsButton: React.FC<NotificationsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <NotificationBadge>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </NotificationBadge>
    </TouchableOpacity>
  );
};

export default NotificationsButton; 