import React from 'react';

const RoomContext = React.createContext(undefined);

export default RoomContext;

export function withRoomContext(Component: React.ComponentType) {
  return (
    props
  ) => (
    <RoomContext.Consumer>
      {(roomClient) => <Component {...props} roomClient={roomClient} />}
    </RoomContext.Consumer>
  );
}
