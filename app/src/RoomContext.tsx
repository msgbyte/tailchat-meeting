import React, { useContext } from 'react';
import type { RoomClient } from './RoomClient';

const RoomContext = React.createContext<RoomClient>(undefined);

export default RoomContext;

export function withRoomContext(Component: React.ComponentType) {
  return (props) => (
    <RoomContext.Consumer>
      {(roomClient) => <Component {...props} roomClient={roomClient} />}
    </RoomContext.Consumer>
  );
}

export function useRoomClient() {
  return useContext(RoomContext);
}
