import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/context/auth';
import { useCreateReviewMutation } from '@/store/notificationsApi';
import type { Emotion } from '@/store/notificationsApi';

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  accountChoreId: string;
}

const EMOTIONS: { value: Emotion; emoji: string; label: string }[] = [
  { value: 'HAPPY', emoji: '😊', label: 'Happy' },
  { value: 'NEUTRAL', emoji: '😐', label: 'Neutral' },
  { value: 'UPSET', emoji: '😟', label: 'Upset' },
  { value: 'MAD', emoji: '😠', label: 'Mad' },
];

const ReviewModal: React.FC<ReviewModalProps> = ({
  isVisible,
  onClose,
  accountChoreId,
}) => {
  const { user } = useAuth();
  const [review, setReview] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('NEUTRAL');
  const [createReview] = useCreateReviewMutation();

  const handleSubmit = async () => {
    try {
      await createReview({
        accountChoreId,
        reviewerId: user?.id ?? '',
        review,
        emotion,
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Review Chore</Text>
          
          <View style={styles.emotionsContainer}>
            {EMOTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.emotionButton,
                  emotion === item.value && styles.selectedEmotion,
                ]}
                onPress={() => setEmotion(item.value)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.emotionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write your review..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emotionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emotionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedEmotion: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
  },
});

export default ReviewModal; 