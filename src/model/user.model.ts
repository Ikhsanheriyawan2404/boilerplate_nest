export class CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles: string[];
}

export class UserSimpleResponse {
  id: number;
  name: string;
  email: string;
}

export class UserResponse {
  id: number;
  email: string;
  name: string;
  roles: {
    id: string;
    name: string;
  }[];
}

export class UpdateUserRequest {
  id: number;
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  roles?: string[];
}
