// import { ListParams, ListResponse, Student } from 'models';
import API from '.';
import { User } from '../../../redux/session/sessionSlice';

export interface SessionParams {
  session: LoginField
}

export interface LoginField {
  email: string
  password: string
  // remember_me: string
}

export interface Response<User> {
  type: string
  user?: User
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
  flash?: [message_type: string, message: string]
  error?: string[]
  status?: number
  message?: string
  errors: {
    [key: string]: string[]
  }
}

export interface ResponseSession<User> {
  user?: User
}

const sessionApi = {
  index(): Promise<ResponseSession<User>> {
    const url = '/sessions';
    return API.get(url);
  },

  create(params: SessionParams): Promise<Response<User>> {
    const url = '/login';
    return API.post(url, params);
  },

  destroy(): Promise<any> {
    const url = '/logout';
    return API.delete(url);
  },
};

export default sessionApi;
