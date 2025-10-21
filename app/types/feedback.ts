export interface Feedback {
  id: string;
  description: string;
  images: string[];
  user_agent?: string;
  url?: string;
  username?: string;
  created_at: string;
}

export interface FeedbackSubmission {
  description: string;
  images: File[];
  user_agent?: string;
  url?: string;
  username?: string;
}
