import React, { useState } from "react";

interface Props {
  onValueChange: (id: string) => void;
  label: string;
}

export default function TextInput(props: Props) {
  const { onValueChange, label } = props;
  const [val, setVal] = useState("");

  function handleValueChange(value: string) {
    setVal(value);
    onValueChange(value);
  }

  return (
    <div>
      <span>{label}</span>
      <input
        type="text"
        value={val}
        onChange={(event) => handleValueChange(event.target.value)}
      />
    </div>
  );
}
