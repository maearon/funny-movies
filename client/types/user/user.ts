// 📁 @types/user.ts

// ...
export interface RegisterInput {
  email: string
  password: string
}

export interface UserCreateParams {
  user: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }
}

export interface UserCreateResponse {
  success?: boolean
  user?: User
  flash?: [message_type: string, message: string]
  status?: number
  message?: string
  errors: {
    [key: string]: string[]
  }
}

export interface UserUpdateParams {
  user: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }
}

export interface UserUpdateResponse<UserEdit> {
  flash_success?: [message_type: string, message: string]
  error?: string[]
  user: UserEdit;
}

// User-related types

// TODO: Add code here...

// 📁 @types/user.ts

import { Micropost } from "@/types/micropost/micropost";

/** 👤 Thông tin user cơ bản */
export interface User {
  id: string;
  name: string;
  gravatar_id: string;
  size: number;
}

/** 📌 Thông tin đăng ký tài khoản */
export interface SignUpField {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** ✅ Response khi tạo user thành công */
export interface CreateResponse<T> {
  success?: boolean;
  user?: T;
  flash?: [message_type: string, message: string];
  status?: number;
  message?: string;
  errors: {
    [key: string]: string[];
  };
}

/** 🧾 Response khi show user */
export interface UserShow {
  id: string;
  name: string;
  gravatar_id: string;
  size: number;
  following: number;
  followers: number;
  current_user_following_user: boolean;
}

/** 🧾 Response đầy đủ khi gọi API `/users/:id` */
export interface ShowResponse<T> {
  user: T;
  id_relationships?: number;
  microposts: Micropost[];
  total_count: number;
}

/** ✏️ Thông tin để sửa user */
export interface UserEdit {
  name: string;
  email: string;
  gravatar: string;
}

/** ✏️ Response khi vào trang edit */
export interface EditResponse {
  user: UserEdit;
  gravatar: string;
  flash?: [message_type: string, message: string];
}

/** 🔄 Payload để update user */
export interface UpdateParams {
  user: UpdateField;
}

export interface UpdateField {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** ✅ Response khi update thành công */
export interface UpdateResponse {
  flash_success?: [message_type: string, message: string];
  error?: string[];
}

/** ✅ Response chung */
export interface Response {
  flash?: [message_type: string, message: string];
}

/** 📄 Kết quả phân trang danh sách user */
export interface ListParams {
  page?: number;
  [key: string]: any;
}

export interface ListResponse<T> {
  users: T[];
  total_count: number;
}

/** 👥 Follow/Follower relationship dùng chung */
export interface UserFollow {
  id: string;
  name: string;
  gravatar_id: string;
  size: number;
}

export interface FollowResponse<TFollow, TMain> {
  users: TFollow[];
  xusers: TFollow[];
  total_count: number;
  user: TMain;
}

export interface IUserFollow {
  id: string;
  name: string;
  followers: number;
  following: number;
  gravatar: string;
  micropost: number;
}
