export interface User {
  idUser: string;
  sub: string;
  name: string;
  email: string;
  profilePicture: string;
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

export interface Notification {
  idNotification: string;
  message: string;
  is_read: Boolean;
  createdAt: Date;
  userTaker: [User];
}

export interface Message {
  conversationId: string;
  sender: {
    uuid: string;
    name?: string;
  };
  text: string;
}
