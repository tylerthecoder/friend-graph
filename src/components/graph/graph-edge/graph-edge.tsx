import React, { useEffect } from "react";
import { friendNodeRadius, moveSpeed } from "../../../constants";
import useDiffAnimation from "../../../hooks/diff-animation";
import { INode } from "../../../types";

interface Props {
  startNode: INode;
  endNode: INode;
  thickness: number;
}

export default function GraphEdge(props: Props) {
  const { startNode, endNode, thickness } = props;

  function nodesToCoords(f1: INode, f2: INode) {
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

  const startPos = nodesToCoords(startNode, endNode);
  const endPos = nodesToCoords(endNode, startNode);

  const { current: pos, setNewValue: setPos } = useDiffAnimation(
    {
      x1: startPos.x,
      y1: startPos.y,
      x2: endPos.x,
      y2: endPos.y,
    },
    moveSpeed,
  );

  // const {
  //   current: { thickness: edgeThickness },
  //   setNewValue: setThickness,
  // } = useDiffAnimation({ thickness }, moveSpeed);

  useEffect(() => {
    setPos(
      {
        x1: startPos.x,
        y1: startPos.y,
        x2: endPos.x,
        y2: endPos.y,
      },
      true,
    );
  }, [startPos.x, startPos.y, endPos.x, endPos.y, setPos]);

  // useEffect(() => {
  //   setThickness({ thickness: edgeThickness }, true);
  // }, [thickness, setThickness]);

  return (
    <g>
      <line
        x1={pos.x1}
        y1={pos.y1}
        x2={pos.x2}
        y2={pos.y2}
        stroke="black"
        strokeWidth={thickness}
      />
    </g>
  );
}
