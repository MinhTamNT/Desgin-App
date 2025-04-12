export interface User {
  idUser: string;
  sub: string;
  name: string;
  email: string;
  profilePicture: string;
  exp: string;
  iat: string;
  token: string;
  status: "online" | "offline" | "away";
}

export interface Project {
  idProject: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  access: string;
  is_host_user: boolean;
  image?: string;
}

export interface Notification {
  idNotification: string;
  message: string;
  is_read: boolean;
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


export interface CanvasObject {

  width: number;

  height: number;

  top: number;

  left: number;

  fill: string;

  [key: string]: any; 
}
