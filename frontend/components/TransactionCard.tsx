import { useAuth } from '@/context/auth';
import { TransactionSplit } from '@/models/transactions';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import { styles } from '../styles/transactionCard.styles';

interface TransactionCardProps {
  split: TransactionSplit;
  onSettle?: (splitId: string) => void;
}

const TransactionCard = ({ split, onSettle }: TransactionCardProps) => {
  const { user } = useAuth();
  const isOwed = split.owedToId === user?.id;

  return (
    <View
      style={[
        styles.transactionItem,
        isOwed ? styles.owedTransaction : styles.owingTransaction,
        split.isSettled && styles.settledTransaction,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          size={40}
          name={isOwed ? split.owedBy.name : split.owedTo.name}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>{split.description}</Text>
          <Text
            style={[
              styles.transactionAmount,
              isOwed ? styles.owedAmount : styles.owingAmount,
              split.isSettled && styles.settledAmount,
            ]}
          >
            ${(split.amountInCents / 100).toFixed(2)}
          </Text>
        </View>
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionDetail}>
            {isOwed ? 'Owed by' : 'You owe'}{' '}
            {isOwed ? split.owedBy.name : split.owedTo.name}
          </Text>
          {split.isSettled ? (
            <Text style={styles.settledText}>Settled</Text>
          ) : (
            isOwed &&
            onSettle && (
              <TouchableOpacity
                style={styles.settleButton}
                onPress={() => onSettle(split.id)}
              >
                <Text style={styles.settleButtonText}>Mark as Settled</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
};

export default TransactionCard;
