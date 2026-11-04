export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  traceId?: string;
  timestamp?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface PageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  organization?: string;
  avatar?: string;
}

export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userInfo: UserInfo;
}