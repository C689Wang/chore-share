import { api } from './api';
import { NotificationResponse } from '@/models/notifications';

export type Emotion = 'HAPPY' | 'NEUTRAL' | 'UPSET' | 'MAD';

export interface CreateReviewRequest {
  accountChoreId: string;
  reviewerId: string;
  review: string;
  emotion: Emotion;
}

export interface ReviewResponse {
  id: string;
  accountChoreId: string;
  reviewerId: string;
  review: string;
  emotion: Emotion;
  createdAt: string;
}

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

    createReview: builder.mutation<ReviewResponse, CreateReviewRequest>({
      query: (body) => ({
        url: `/chores/${body.accountChoreId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification', 'Chore'],
    }),
  }),
});

export const {
  useGetAccountNotificationsQuery,
  useMarkNotificationSeenMutation,
  useCreateReviewMutation,
} = notificationsApi;
