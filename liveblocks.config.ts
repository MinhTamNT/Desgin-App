// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
import { LiveMap, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const publicKey = import.meta.env.VITE_LIVE_BLOCK;

// Nâng cấp client của Liveblocks với xác thực
const client = createClient({
  throttle: 16,
  publicApiKey: publicKey,
  authEndpoint: async (roomId) => {
    console.log(`Authenticating for room: ${roomId}`);    
    
    let userJson = localStorage.getItem('currentUser');
    let user;
    
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      user = null;
    }
    
    if (!user) {
      console.warn(`No user found in localStorage for room ${roomId}, using default user data`);
      user = {
        sub: `anonymous-${Date.now()}`,
        name: 'Người dùng',
        picture: 'https://liveblocks.io/avatar-placeholder.png',
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    return {
      token: JSON.stringify({
        userId: user.sub,
        roomId: roomId, 
        userInfo: {
          name: user.name,
          avatar: user.picture,
          status: 'online',
        },
      }),
    };
  },
});

export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
  userId: string;
  userName: string;
  userAvatar: string;
};
declare global {
  export interface Liveblocks {
    Presence: {
      // User info in presence
      name?: string;
      picture?: string;
      id?: string;
    };

    Storage: {
      canvasObjects: LiveMap<string, any>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        status: string;
      };
    };

    RoomEvent: {};
    ThreadMetadata: ThreadMetadata;
    RoomInfo: {};
  }
}

const {
  suspense: {
    RoomProvider,
    useBroadcastEvent,
    useCreateThread,
    useEditThreadMetadata,
    useEventListener,
    useMyPresence,
    useOthers,
    useRoomInfo,
    useThreads,
    useUser,
    useSelf,
  },
} = createRoomContext(client); 

export {
  RoomProvider,
  useBroadcastEvent,
  useCreateThread,
  useEditThreadMetadata,
  useEventListener,
  useMyPresence,
  useOthers,
  useRoomInfo,
  useThreads,
  useUser,
  useSelf,
}; // Export ThreadMetadata

// Hàm tiện ích để lưu người dùng hiện tại vào localStorage
export const saveUserToLocalStorage = (user: any) => {
  if (user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('User saved to localStorage:', user.name);
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  }
};
