import React, { useEffect } from "react";
import { friendNodeRadius, moveSpeed } from "../../constants";
import useDiffAnimation from "../../hooks/diff-animation";

interface Props {
  x: number;
  y: number;
  img: string;
}

export default function FriendNode(props: Props) {
  const { current: pos, setNewValue: setPos } = useDiffAnimation(
    { x: props.x, y: props.y },
    moveSpeed,
  );

  useEffect(() => {
    setPos({ x: props.x, y: props.y }, true);
  }, [props.x, props.y, setPos]);

  return (
    <g>
      <defs>
        <clipPath id={`circle-cut-out-${props.img}`}>
          <circle cx={pos.x} cy={pos.y} r={friendNodeRadius} />
        </clipPath>
      </defs>
      <image
        x={pos.x - friendNodeRadius}
        y={pos.y - friendNodeRadius}
        href={props.img}
        height={friendNodeRadius * 2}
        width={friendNodeRadius * 2}
        clipPath={`url(#circle-cut-out-${props.img})`}
      />
    </g>
  );
}
