import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { styles } from '@/styles/notificationCard.styles';
import {
  NotificationResponse,
  NotificationAction,
} from '@/models/notifications';
import Avatar from './Avatar';
import ReviewModal from './ReviewModal';
import { useAuth } from '@/context/auth';

interface NotificationCardProps {
  notification: NotificationResponse;
}

const getActionText = (action: NotificationAction): string => {
  switch (action) {
    case NotificationAction.CHORE_ASSIGNED:
      return 'was assigned';
    case NotificationAction.CHORE_COMPLETED:
      return 'completed';
    case NotificationAction.CHORE_PENDING:
      return 'has a pending';
    case NotificationAction.TRANSACTION_ADDED:
      return 'added a transaction';
    case NotificationAction.TRANSACTION_SETTLED:
      return 'settled a transaction';
    case NotificationAction.REVIEW_SUBMITTED:
      return 'submitted a review';
    default:
      return (action as string).toLowerCase();
  }
};

const formatDate = (date: string): string => {
  const currentDate = new Date(date);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const year = currentDate.getFullYear();
  return `${month}/${day}/${year}`;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const { user } = useAuth();
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!notification.seen) {
      // Call your API to mark as seen
      // You can implement this using your API client
    }
  };

  const getNotificationContent = () => {
    if (notification.choreInfo) {
      return notification.choreInfo.title;
    }
    if (notification.transactionInfo) {
      return notification.transactionInfo.description;
    }
    if (notification.reviewInfo) {
      return notification.reviewInfo.review;
    }
    return '';
  };

  const showReviewButton = 
    notification.action === NotificationAction.CHORE_COMPLETED && 
    notification.actor.id !== user?.id &&
    notification.choreInfo;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Avatar size={40} name={notification.actor.name} style={styles.avatar} />
      <View style={styles.textCol}>
        <View style={styles.textRow}>
          <Text style={styles.textName}>{notification.actor.name}</Text>
          <Text style={styles.textAction}>
            {' '}
            {getActionText(notification.action as NotificationAction)}
          </Text>
        </View>
        <Text style={styles.textChore}>{getNotificationContent()}</Text>
        <Text style={styles.textDate}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>
      {showReviewButton && (
        <>
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => setIsReviewModalVisible(true)}
          >
            <Text style={{ color: 'blue' }}>Review</Text>
          </TouchableOpacity>
          <ReviewModal
            isVisible={isReviewModalVisible}
            onClose={() => setIsReviewModalVisible(false)}
            accountChoreId={notification.choreInfo!.accountChoreId}
          />
        </>
      )}
    </View>
  );
};

export default NotificationCard;
