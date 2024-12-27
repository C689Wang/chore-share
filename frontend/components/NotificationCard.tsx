import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { styles } from '@/styles/notificationCard.styles';
import {
  NotificationResponse,
  NotificationAction,
} from '@/models/notifications';
import { useMarkNotificationsAsSeenMutation } from '@/store/notificationsApi';
import { useAppSelector } from '@/store/hooks';
import Avatar from './Avatar';
import ReviewModal from './ReviewModal';
import ViewReviewModal from './ViewReviewModal';
import { useAuth } from '@/context/auth';

interface NotificationCardProps {
  notification: NotificationResponse;
  onSeen?: (notificationId: string) => void;
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
      return 'submitted a review for';
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
  onSeen,
}) => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isViewReviewModalVisible, setIsViewReviewModalVisible] = useState(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!notification.seen && onSeen) {
      onSeen(notification.id);
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
      return notification.reviewInfo.choreName;
    }
    if (notification.splitInfo) {
      return notification.splitInfo.description;
    }
    return '';
  };

  const getSplitInfo = () => {
    if (notification.splitInfo) {
      return ` from ${notification.splitInfo.owedByName}`;
    }
    return '';
  };

  const showReviewButton =
    notification.action === NotificationAction.CHORE_COMPLETED &&
    notification.actor.id !== user?.id &&
    notification.choreInfo;

  const showViewReviewButton =
    notification.action === NotificationAction.REVIEW_SUBMITTED &&
    notification.reviewInfo;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Avatar size={40} name={notification.actor.name} style={styles.avatar} />
      <View style={styles.textCol}>
        <View style={styles.textRow}>
          <Text style={styles.textName}>{notification.actor.name}</Text>
          <Text style={styles.textAction}>
            {getActionText(notification.action as NotificationAction)}
          </Text>
        </View>
        <Text style={styles.textChore} numberOfLines={2}>
          {getNotificationContent()}
          {getSplitInfo()}
        </Text>
        <Text style={styles.textDate}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {showReviewButton && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsReviewModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Review</Text>
            </TouchableOpacity>
            <ReviewModal
              isVisible={isReviewModalVisible}
              onClose={() => setIsReviewModalVisible(false)}
              accountChoreId={notification.choreInfo!.accountChoreId}
            />
          </>
        )}
        {showViewReviewButton && notification.reviewInfo && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsViewReviewModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
            <ViewReviewModal
              isVisible={isViewReviewModalVisible}
              onClose={() => setIsViewReviewModalVisible(false)}
              reviewId={notification.reviewInfo.reviewId}
              accountChoreId={notification.reviewInfo.accountChoreId}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default NotificationCard;
