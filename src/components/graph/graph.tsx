import React from "react";
import { IConnection, IGraphState } from "../../types";
import GraphEdge from "./graph-edge/graph-edge";
import FriendNode from "./graph-node/graph-node";

interface Props {
  graphState: IGraphState;
}

export default function Graph(props: Props) {
  const { graphState } = props;

  function toConnectionProps(connection: IConnection) {
    const startNode = graphState.nodes[connection.startId];
    const endNode = graphState.nodes[connection.endId];
    return {
      ...connection,
      thickness: connection.weight,
      startNode,
      endNode,
      key: `${startNode.id},${endNode.id}`,
    };
  }

  return (
    <svg id="friendGraph">
      {Object.values(graphState.nodes).map((friend) => (
        <FriendNode {...friend} key={friend.id} />
      ))}
      {Object.values(graphState.connections).map((connection) => (
        <GraphEdge {...toConnectionProps(connection)} />
      ))}
    </svg>
  );
}
