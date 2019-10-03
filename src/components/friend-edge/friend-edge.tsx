import React, { useEffect } from "react";
import { moveSpeed } from "../../constants";
import useDiffAnimation from "../../hooks/diff-animation";

interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
}

export default function FriendEdge(props: Props) {
  const { current: pos, setNewValue: setPos } = useDiffAnimation(
    {
      x1: props.x1,
      y1: props.y1,
      x2: props.x2,
      y2: props.y2,
    },
    moveSpeed,
  );
  const {
    current: { thickness },
    setNewValue: setThickness,
  } = useDiffAnimation({ thickness: props.thickness }, moveSpeed);

  useEffect(() => {
    setPos(
      {
        x1: props.x1,
        y1: props.y1,
        x2: props.x2,
        y2: props.y2,
      },
      true,
    );
  }, [props.x1, props.x2, props.y1, props.y2, setPos]);

  useEffect(() => {
    setThickness({ thickness: props.thickness }, true);
  }, [props.thickness, setThickness]);

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
