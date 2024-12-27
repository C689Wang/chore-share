import { useGetAccountNotificationsQuery } from '@/store/notificationsApi';
import { useAuth } from '@/context/auth';
import { useAppSelector } from '@/store/hooks';

export const useUnseenNotifications = () => {
  const { user } = useAuth();
  const selectedHouseholdId = useAppSelector(
    (state) => state.households.selectedHouseholdId
  );

  const { data: notifications = [] } = useGetAccountNotificationsQuery({
    accountId: user?.id ?? '',
    householdId: selectedHouseholdId ?? '',
  }, {
    pollingInterval: 30000, // Poll every 30 seconds for new notifications
  });

  const unseenCount = notifications.filter(n => !n.seen).length;
  const hasUnseen = unseenCount > 0;

  return {
    unseenCount,
    hasUnseen,
  };
}; 