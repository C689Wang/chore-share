import { AccountChore } from '@/models/chores';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { styles } from '../styles/choresView.styles';
import ChoreCard from './ChoreCard';

interface IChoreView {
  isUser: boolean;
  data: AccountChore[];
  onRefresh?: () => Promise<void>;
}

interface GroupedChores {
  date: Date;
  label: string;
  dateString: string;
  chores: AccountChore[];
}

const ChoresView = ({ isUser, data, onRefresh }: IChoreView) => {
  const [isLoading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getGroupedChores = (chores: AccountChore[]): GroupedChores[] => {
    // Sort chores by due date
    const sortedChores = [...chores].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    // Group chores by due date
    const grouped = sortedChores.reduce(
      (acc: { [key: string]: AccountChore[] }, chore) => {
        // Create date in UTC and subtract one day since due dates are end-of-day
        const date = new Date(chore.dueDate);
        const adjustedDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const dateKey = adjustedDate.toISOString().split('T')[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(chore);
        return acc;
      },
      {}
    );

    // Get current week's start and end in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    // Convert to array with labels
    return Object.entries(grouped).map(([dateStr, chores]) => {
      const date = new Date(dateStr + 'T00:00:00.000Z'); // Force UTC midnight
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      // Format the date string in UTC
      const dateString = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date);

      let label;
      if (date.getTime() < today.getTime()) {
        label = 'Previous';
      } else if (date.getTime() > endOfWeek.getTime()) {
        label = 'Upcoming';
      } else {
        label = dayNames[date.getUTCDay()];
      }

      return {
        date,
        label,
        dateString,
        chores,
      };
    });
  };

  const groupedChores = getGroupedChores(data);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          style={styles.flatListContainer}
          data={groupedChores}
          keyExtractor={(item) => item.date.toISOString()}
          ItemSeparatorComponent={() => <View style={{ height: 25 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor='#D2D7D3' // Match your app's theme
              colors={['#DED7D3']} // For Android
            />
          }
          renderItem={({ item }) => (
            <View>
              <View style={styles.headerContainer}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    marginBottom: 12,
                  }}
                >
                  {item.label}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '400' }}>
                  {item.dateString}
                </Text>
              </View>
              {item.chores.map((chore, index) => (
                <ChoreCard key={chore.id} item={chore} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default ChoresView;
