import React, { useEffect, useState } from "react";

interface Coords {
  x: number;
  y: number;
}

const defaultCoords: Coords = {
  x: -1,
  y: -1,
};

interface Props {
  onValueChange: (coords: Coords) => void;
}

export default function PositionSelector(props: Props) {
  const [selecting, setSelected] = useState(false);
  const [mousePos, setMousePos] = useState(defaultCoords);

  useEffect(() => {
    if (selecting) {
      const handleSvgClick = (event: MouseEvent) => {
        const { offsetX, offsetY } = event;
        document.getElementById("graph")!.style.cursor = "default";
        const pos = {
          x: offsetX,
          y: offsetY,
        };
        setMousePos(pos);
        props.onValueChange(pos);
        setSelected(false);
      };

      const handleSvgHover = (event: MouseEvent) => {
        const { offsetX, offsetY } = event;
        setMousePos({
          x: offsetX,
          y: offsetY,
        });
      };

      document
        .getElementById("graph")!
        .addEventListener("click", handleSvgClick);

      document
        .getElementById("graph")!
        .addEventListener("mousemove", handleSvgHover);

      document.getElementById("graph")!.style.cursor = "crosshair";

      return () => {
        document
          .getElementById("graph")!
          .removeEventListener("click", handleSvgClick);

        document
          .getElementById("graph")!
          .removeEventListener("mousemove", handleSvgHover);
      };
    }
  });

  function handleSelectButton() {
    setSelected(true);
  }

  return (
    <div>
      <button onClick={handleSelectButton}> Select Point </button>
      {mousePos.x >= 0 ? `${mousePos.x},${mousePos.y}` : ""}
    </div>
  );
}
