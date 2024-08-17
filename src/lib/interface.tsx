export interface User {
  sub: string;
  name: string;
  email: string;
  picture: string;
  exp: Date;
  iat: Date;
}

export interface Project {
  idProject: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  access: string;
  is_host_user: Boolean;
}
