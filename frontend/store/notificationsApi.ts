import { api } from './api';
import { NotificationResponse } from '@/models/notifications';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAccountNotifications: builder.query<
      NotificationResponse[],
      { accountId: string; householdId: string }
    >({
      query: ({ accountId, householdId }) => ({
        url: `/accounts/${accountId}/households/${householdId}/notifications`,
      }),
      providesTags: (result, error, { accountId }) => [
        { type: 'Notification', id: accountId },
        'Notification',
      ],
    }),

    markNotificationSeen: builder.mutation<
      void,
      { accountId: string; householdId: string; notificationId: string }
    >({
      query: ({ accountId, householdId, notificationId }) => ({
        url: `/accounts/${accountId}/households/${householdId}/notifications/${notificationId}/seen`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    markNotificationsAsSeen: builder.mutation<
      void,
      { accountId: string; householdId: string; notificationIds: string[] }
    >({
      query: ({ accountId, householdId, notificationIds }) => ({
        url: `/accounts/${accountId}/households/${householdId}/notifications/seen`,
        method: 'PUT',
        body: { notificationIds },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetAccountNotificationsQuery,
  useMarkNotificationSeenMutation,
  useMarkNotificationsAsSeenMutation,
} = notificationsApi;
