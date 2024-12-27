import { useAuth } from '@/context/auth';
import { TransactionSplit, TransactionSummary } from '@/models/transactions';
import { useAppSelector } from '@/store/hooks';
import {
  useCreateTransactionMutation,
  useGetTransactionSummaryQuery,
  useSettleTransactionSplitMutation,
} from '@/store/transactionsApi';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TransactionCard from '../../components/TransactionCard';
import { styles } from '../../styles/transactions.styles';
import {
  formatToLocalDate,
  parseUTCDate,
  toUTCString,
} from '@/utils/dateUtils';

interface GroupedTransactions {
  date: string;
  label: string;
  splits: TransactionSplit[];
}

const TransactionsScreen = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [tempMonth, setTempMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [spentAt, setSpentAt] = useState(new Date());

  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetTransactionSummaryQuery({
    accountId: user?.id ?? '',
    householdId: selectedHouseholdId ?? '',
    month: selectedMonth,
  });

  const [createTransaction] = useCreateTransactionMutation();
  const [settleTransactionSplit] = useSettleTransactionSplitMutation();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchSummary();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setCost(cleanedText);
  };

  const handleCreateTransaction = async () => {
    if (!cost || !description || !selectedHouseholdId || !user?.id) return;

    try {
      await createTransaction({
        accountId: user.id,
        householdId: selectedHouseholdId,
        params: {
          description,
          amountInCents: Math.round(parseFloat(cost) * 100),
          spentAt: toUTCString(spentAt),
        },
      }).unwrap();

      setShowDropdown(false);
      setDescription('');
      setCost('');
      setSpentAt(new Date());
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleSettleTransaction = async (splitId: string) => {
    if (!selectedHouseholdId || !user?.id) return;
    try {
      await settleTransactionSplit({
        accountId: user.id,
        householdId: selectedHouseholdId,
        splitId: splitId,
      }).unwrap();
    } catch (error) {
      console.error('Failed to settle transaction:', error);
    }
  };

  const getGroupedTransactions = (
    summary: TransactionSummary | undefined | null
  ): GroupedTransactions[] => {
    if (!summary) return [];
    if (!summary.owingDetails || !summary.owedDetails) return [];

    // Combine all splits from both owing and owed details
    const allSplits = summary.owingDetails
      .reduce((acc, detail) => {
        if (!detail.splits) return acc;
        return acc.concat(detail.splits);
      }, [] as TransactionSplit[])
      .concat(
        summary.owedDetails.reduce((acc, detail) => {
          if (!detail.splits) return acc;
          return acc.concat(detail.splits);
        }, [] as TransactionSplit[])
      );

    if (!allSplits) return [];

    const grouped = allSplits.reduce(
      (acc: { [key: string]: TransactionSplit[] }, split) => {
        if (!split.spentAt) {
          console.warn('Split missing spentAt:', split);
          return acc;
        }

        let date;
        try {
          const spentAtDate = parseUTCDate(
            typeof split.spentAt === 'string'
              ? split.spentAt
              : split.spentAt.toISOString()
          );

          date = spentAtDate.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error parsing date:', split.spentAt, error);
          return acc;
        }

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(split);
        return acc;
      },
      {}
    );

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, splits]) => ({
        date,
        label: formatToLocalDate(date),
        splits: splits.sort((a, b) => {
          const dateA = new Date(a.spentAt).getTime();
          const dateB = new Date(b.spentAt).getTime();
          return dateB - dateA;
        }),
      }));
  };

  const renderSummarySection = (summary: TransactionSummary) => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>You are owed</Text>
        <Text style={styles.summaryAmount}>
          ${(summary.totalOwed / 100).toFixed(2)}
        </Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>You owe</Text>
        <Text style={styles.summaryAmount}>
          ${(summary.totalOwing / 100).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // Helper function to format month display
  const formatMonthDisplay = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const isValidTransaction = () => {
    return (
      cost.length > 0 &&
      parseFloat(cost) > 0 &&
      description.trim().length > 0 &&
      selectedHouseholdId &&
      user?.id
    );
  };

  if (summaryLoading || !summary) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFCF4' }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text style={styles.monthText}>
            {formatMonthDisplay(selectedMonth)}
          </Text>
          <MaterialIcons name='arrow-drop-down' size={24} color='#666' />
        </TouchableOpacity>

        {showMonthPicker &&
          (Platform.OS === 'ios' ? (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={(() => {
                  const [year, month] = tempMonth.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1);
                })()}
                mode='date'
                display='spinner'
                maximumDate={new Date()}
                style={{ width: 150, height: 150 }}
                themeVariant='light'
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempMonth(selectedDate.toISOString().slice(0, 7));
                  }
                }}
              />
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={() => {
                    setShowMonthPicker(false);
                    setTempMonth(selectedMonth);
                  }}
                >
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={() => {
                    setSelectedMonth(tempMonth);
                    setShowMonthPicker(false);
                    refetchSummary();
                  }}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={new Date(tempMonth + '-01')}
              mode='date'
              display='default'
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowMonthPicker(false);
                if (selectedDate) {
                  const newMonth = selectedDate.toISOString().slice(0, 7);
                  setSelectedMonth(newMonth);
                  setTempMonth(newMonth);
                  refetchSummary();
                }
              }}
            />
          ))}

        {renderSummarySection(summary)}

        <TouchableOpacity
          style={showDropdown ? styles.cancelButton : styles.addButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          {showDropdown ? (
            <MaterialIcons name='remove' size={24} color='white' />
          ) : (
            <MaterialIcons name='add' size={24} color='white' />
          )}
          <Text style={styles.addButtonText}>
            {showDropdown ? 'Cancel' : 'Add Expense'}
          </Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => setDescription(text)}
                value={description}
                placeholderTextColor='#D9D9D9'
                placeholder='e.g. Groceries'
                selectionColor={'#A9A9A9'}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cost</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor='#D9D9D9'
                placeholder='$0.00'
                onChangeText={handleAmountChange}
                value={cost}
                keyboardType='decimal-pad'
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {spentAt.toLocaleDateString()}
                </Text>
                <MaterialIcons name='event' size={24} color='#666' />
              </TouchableOpacity>
            </View>

            {showDatePicker &&
              (Platform.OS === 'ios' ? (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={spentAt}
                    mode='datetime'
                    display='spinner'
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setSpentAt(selectedDate);
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <DateTimePicker
                  value={spentAt}
                  mode='datetime'
                  display='default'
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setSpentAt(selectedDate);
                    }
                  }}
                />
              ))}

            <TouchableOpacity
              style={[
                styles.createButton,
                !isValidTransaction() && styles.createButtonDisabled,
              ]}
              disabled={!isValidTransaction()}
              onPress={handleCreateTransaction}
            >
              <Text style={styles.createButtonText}>+ Add new</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={getGroupedTransactions(summary)}
          renderItem={({ item }) => (
            <View style={styles.groupContainer}>
              <Text style={styles.dateLabel}>{item.label}</Text>
              {item.splits.map((split) => (
                <TransactionCard
                  key={split.id}
                  split={split}
                  onSettle={handleSettleTransaction}
                />
              ))}
            </View>
          )}
          keyExtractor={(item) => item.date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default TransactionsScreen;
