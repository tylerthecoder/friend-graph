import React, { useState } from "react";
import { IConnection, IGraphState } from "../../types";
import Connection from "../connection/connection";
import Events, { emptyGraphState } from "../events/events";
import FriendNode from "../friend-node/friend-node";
import "./app.css";

function App() {
  const [graphState, setGraphState] = useState(emptyGraphState);

  function toConnectionProps(connection: IConnection) {
    const startFriend = graphState.nodes[connection.startId];
    const endFriend = graphState.nodes[connection.endId];
    return {
      ...connection,
      thickness: connection.weight,
      startFriend,
      endFriend,
      key: `${startFriend.id},${endFriend.id}`,
    };
  }

  function handleNewGraphState(state: IGraphState) {
    setGraphState(state);
  }

  return (
    <div className="App">
      <Events onEventChange={handleNewGraphState} />
      <svg id="friendGraph">
        {Object.values(graphState.nodes).map((friend) => (
          <FriendNode {...friend} key={friend.id} />
        ))}
        {Object.values(graphState.connections).map((connection) => (
          <Connection {...toConnectionProps(connection)} />
        ))}
      </svg>
    </div>
  );
}

export default App;
