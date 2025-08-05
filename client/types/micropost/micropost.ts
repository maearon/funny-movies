// Micropost-related types

// TODO: Add code here...

// 📁 @types/micropost.ts

/** 🧩 Common query params */
export interface ListParams {
  page?: number;
  [key: string]: any;
}

/** 📌 Micropost item */
export interface Micropost {
  readonly id: number;
  content: string;
  gravatar_id?: string;
  image: string;
  size: number;
  timestamp: string;
  readonly user_id: string;
  user_name?: string;
  title?: string;
  description?: string;
  videoId?: string;
  channelTitle?: string;
}

/** 📋 Response when listing microposts */
export interface ListResponse<T = Micropost> {
  feed_items: T[];
  followers: number;
  following: number;
  gravatar: string;
  micropost: number;
  total_count: number;
}

/** ✅ Standard response with optional flash message */
export interface Response {
  flash?: [message_type: string, message: string];
}
