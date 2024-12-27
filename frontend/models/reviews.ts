export interface ChoreReview {
  id: string;
  choreId: string;
  accountId: string;
  review: string;
  createdAt: Date;
}

export type Emotion = 'HAPPY' | 'NEUTRAL' | 'UPSET' | 'MAD';

export interface CreateReviewRequest {
  reviewerStatus: string;
  reviewerComment: string;
}

export interface ReviewResponse {
  id: string;
  accountChoreId: string;
  reviewerId: string;
  review: string;
  emotion: Emotion;
  createdAt: string;
}

export interface ChoreReviewResponse {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerStatus: string;
  reviewComment: string;
  createdAt: string;
}
