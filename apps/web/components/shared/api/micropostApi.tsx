// import { ListParams, ListResponse, Student } from 'models';
import API from '.';
import { ErrorMessageType } from '../errorMessages';

export interface ListParams {
  page?: number
  [key: string]: any
}

export interface ListResponse<Micropost> {
  feed_items: Micropost[]
  followers: number
  following: number
  gravatar: string
  micropost: number
  total_count: number
}

export interface Micropost {
  readonly id: number
  content: string
  title?: string
  youtube_id?: string
  gravatar_id?: string
  image: string
  size: number
  timestamp: string
  readonly user_id: string
  user_name?: string
  description?: string
  videoId?: string
  channelTitle?: string
}

// export interface CreateParams {
//   user: SignUpField
// }

// export interface SignUpField {
//   name: string
//   email: string
//   password: string
//   password_confirmation: string
// }

export interface CreateResponse {
  flash?: [message_type: string, message: string]
  error?: ErrorMessageType | string[]
}

export interface Response {
  flash?: [message_type: string, message: string]
}

export interface CreateMicropostParams {
  content: string
  title: string
  youtube_id: string
  image: File
}

const micropostApi = {
  getAll(params: ListParams): Promise<ListResponse<Micropost>> {
    const url = '';
    return API.get(url, { params });
  },

  create(params: CreateMicropostParams): Promise<CreateResponse> {
    const url = "/microposts"
    const fd = new FormData()
    fd.append("micropost[content]", params.content)
    fd.append("micropost[title]", params.title)
    fd.append("micropost[youtube_id]", params.youtube_id)
    if (params.image) {
      fd.append("micropost[image]", params.image)
    }
    return API.post(url, fd)
  },

  remove(id: number): Promise<Response> {
    const url = `/microposts/${id}`;
    return API.delete(url);
  },

};

export default micropostApi;
