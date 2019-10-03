import React from "react";
import { friendNodeRadius } from "../../constants";
import FriendEdge from "../friend-edge/friend-edge";
import { INode } from "../../types";

export default function Connection(props: any) {
  const { startFriend, endFriend } = props;

  function getEdgeCords(f1: INode, f2: INode) {
    const dx = f2.x - f1.x;
    const dy = f2.y - f1.y;
    const angle = Math.atan(dy / dx);
    const mx = (dx > 0 ? 1 : -1) * Math.cos(angle) * friendNodeRadius;
    const my = (dy > 0 ? 1 : -1) * Math.sin(angle) * friendNodeRadius;
    return {
      x: f1.x + mx,
      y: f1.y + my,
    };
  }

  const f1 = getEdgeCords(startFriend, endFriend);
  const f2 = getEdgeCords(endFriend, startFriend);

  return (
    <FriendEdge
      x1={f1.x}
      x2={f2.x}
      y1={f1.y}
      y2={f2.y}
      thickness={props.thickness}
    />
  );
}
