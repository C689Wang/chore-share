import { formatToLocalDate } from '@/utils/dateUtils';
import { useAuth } from '@/context/auth';
import { TransactionSplit } from '@/models/transactions';
import React from 'react';
import { Text, View } from 'react-native';
import Avatar from './Avatar';
import { styles } from '../styles/transactionCard.styles';

interface Props {
  split: TransactionSplit;
}

export default function TransactionCard({ split }: Props) {
  const { user } = useAuth();
  const isOwed = split.owedToId === user?.id;

  return (
    <View style={[
      styles.transactionItem,
      isOwed ? styles.owedTransaction : styles.owingTransaction
    ]}>
      <View style={styles.avatarContainer}>
        <Avatar 
          size={40} 
          name={isOwed ? split.owedBy.name : split.owedTo.name} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>
            {split.description}
          </Text>
          <Text style={[
            styles.transactionAmount,
            isOwed ? styles.owedAmount : styles.owingAmount
          ]}>
            ${(split.amountInCents / 100).toFixed(2)}
          </Text>
        </View>
        <Text style={styles.transactionDetail}>
          {isOwed ? 'Owed by' : 'You owe'} {isOwed ? split.owedBy.name : split.owedTo.name}
        </Text>
      </View>
    </View>
  );
}
