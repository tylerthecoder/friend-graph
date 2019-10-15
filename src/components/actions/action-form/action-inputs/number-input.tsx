import React, { useState } from "react";

interface Props {
  onValueChange: (id: number) => void;
  label: string;
}

export default function NumberInput(props: Props) {
  const { onValueChange, label } = props;
  const [val, setVal] = useState(0);

  function handleValueChange(value: number) {
    setVal(value);
    onValueChange(value);
  }

  return (
    <div>
      <span>{label}</span>
      <input
        type="number"
        value={val}
        onChange={(event) => handleValueChange(Number(event.target.value))}
      />
    </div>
  );
}
