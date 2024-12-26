import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '@/styles/household.styles';
import { LinearGradient } from 'expo-linear-gradient';
import HorizontalList from '@/components/HorizontalList';
import { useGetHouseholdLeaderboardQuery } from '@/store/householdsApi';
import { useGetAccountChoresQuery } from '@/store/choresApi';
import { useAuth } from '@/context/auth';
import { useAppSelector } from '@/store/hooks';
import { LeaderboardEntry } from '@/models/households';
import Avatar from '@/components/Avatar';

const Household = () => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );

  // Fetch leaderboard and chores data using RTK Query
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } =
    useGetHouseholdLeaderboardQuery(selectedHouseholdId ?? '', {
      skip: !selectedHouseholdId,
    });

  const { data: accountChores = [], isLoading: isChoresLoading } =
    useGetAccountChoresQuery(
      {
        accountId: user?.id ?? '',
        householdId: selectedHouseholdId ?? '',
      },
      {
        skip: !user?.id || !selectedHouseholdId,
      }
    );

  // Find the highest points in the leaderboard
  const maxPoints = leaderboard.length
    ? Math.max(...leaderboard.map((entry: LeaderboardEntry) => entry.points))
    : 0;

  const getCurrentMonth = () => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[new Date().getMonth()];
  };

  const colors = [
    ['#D5F5Df', '#C0F1C9'],
    ['#FCE3FC', '#DBD2FB'],
    ['#FFE9A4', '#FED8A3'],
    ['#D3FBFD', '#C2EAFC'],
    ['#FFD6E5', '#FFBDC7'],
    ['#E0C3FC', '#B8A7FF'],
    ['#FFCBA4', '#FFB088'],
    ['#A8E6CF', '#86DEB7'],
    ['#FFF3B0', '#FFE66D'],
    ['#C4E0E5', '#A5CAE3'],
  ];

  const isLoading = isLeaderboardLoading || isChoresLoading;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.monthTitle}>{getCurrentMonth()}</Text>
          <View style={styles.leaderboardContainer}>
            {leaderboard.map((entry: LeaderboardEntry, index: number) => (
              <View key={entry.accountId} style={styles.leaderboardEntry}>
                {entry.points === maxPoints && (
                  <Text style={styles.leaderboardItemCrown}>👑</Text>
                )}
                <Avatar
                  name={entry.accountName}
                  size={40}
                  style={styles.leaderboardAvatar}
                />
                <Text style={styles.leaderboardPoints}>{entry.points}</Text>
                <LinearGradient
                  colors={[colors[index][0], colors[index][1]]}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={styles.leaderboardPointsBar}
                >
                  <View
                    style={{
                      width: '100%',
                      height: `${(entry.points / maxPoints) * 50}%`,
                      borderTopLeftRadius: 20,
                      borderTopEndRadius: 20,
                    }}
                  />
                </LinearGradient>
              </View>
            ))}
          </View>
          <HorizontalList items={accountChores} />
        </>
      )}
    </View>
  );
};

export default Household;
