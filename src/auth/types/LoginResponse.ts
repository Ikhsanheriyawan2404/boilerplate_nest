export type LoginResponse = {
  data: {
    id: number
    name: string
    email: string
    roles: {
      id: number,
      name: string
    }[]
  }
  access: {
    token: string,
    expires: string,
  },
  refresh: {
    token: string,
    expires: string,
  },
};
