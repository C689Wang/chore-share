import { useAuth } from '@/context/auth';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles/homeHeader.styles';
import Avatar from './Avatar';
import NotificationsModal from './NotificationsModal';
import NotificationsButton from './NotificationsButton';

const HomeHeader: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.headerUserInfo}>
        <Avatar size={45} name={user?.name || ''} />
        <View>
          <Text style={styles.headerMessage}>Welcome back!👋</Text>
          <Text style={styles.headerName}>{user?.name || ''}</Text>
        </View>
      </View>
      <View style={styles.headerNotifications}>
        <NotificationsButton onPress={() => setIsModalOpen(true)} />
      </View>
      <NotificationsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </View>
  );
};

export default HomeHeader;
