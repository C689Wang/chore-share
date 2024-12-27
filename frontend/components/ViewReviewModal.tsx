import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useGetChoreReviewQuery } from '@/store/choresApi';
import { styles } from '@/styles/reviewModal.styles';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/context/auth';

interface ViewReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  reviewId: string;
  accountChoreId: string;
}

const ViewReviewModal: React.FC<ViewReviewModalProps> = ({
  isVisible,
  onClose,
  reviewId,
  accountChoreId,
}) => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );
  const { data: review, isLoading } = useGetChoreReviewQuery(
    {
      accountId: user?.id ?? '',
      householdId: selectedHouseholdId ?? '',
      accountChoreId: accountChoreId ?? '',
      reviewId,
    },
    { skip: !isVisible }
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Review Details</Text>

          {isLoading ? (
            <ActivityIndicator size='large' />
          ) : review ? (
            <View>
              <Text style={styles.label}>Reviewer</Text>
              <Text style={styles.text}>{review.reviewerName}</Text>

              <Text style={styles.label}>Status</Text>
              <Text style={styles.text}>{review.reviewerStatus}</Text>

              <Text style={styles.label}>Comment</Text>
              <Text style={styles.text}>{review.reviewComment}</Text>

              <Text style={styles.label}>Date</Text>
              <Text style={styles.text}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text>Failed to load review</Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ViewReviewModal;
