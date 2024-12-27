import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUnseenNotifications } from '@/hooks/useUnseenNotifications';

interface NotificationBadgeProps {
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ children }) => {
  const { unseenCount, hasUnseen } = useUnseenNotifications();

  return (
    <View style={styles.container}>
      {children}
      {hasUnseen && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unseenCount > 99 ? '99+' : unseenCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge; 