"use client";

import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import { Loader } from "../Loader/Loader";

interface RoomProp {
  children: React.ReactNode;
  idRoom: string;
}

const Room = ({ children, idRoom }: RoomProp) => {
  return (
    <RoomProvider
      id={idRoom}
      initialPresence={{ cursor: null, cursorColor: null, editingText: null }}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Room;
