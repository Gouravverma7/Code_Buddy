export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  previewThumbnail?: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  viewCount: number;
  likeCount?: number;
  subscriberCount?: number;
  publishedAt: string;
  duration?: number;
  description?: string;
  videoUrl?: string;
  tags?: string[];
  categories?: string[];
}

export interface CommentData {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  replies?: CommentData[];
}