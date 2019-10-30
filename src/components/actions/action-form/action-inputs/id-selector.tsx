import React, { useState } from "react";

interface Props {
  onValueChange: (id: string) => void;
  label: string;
  ids: string[];
}

export default function IdSelector(props: Props) {
  const { onValueChange, ids, label } = props;
  const [val, setVal] = useState("");

  if (ids.indexOf(val) === -1) {
    if (ids.length === 0 && val !== "") {
      handleValueChange("");
    } else if (ids.length > 0) {
      handleValueChange(ids[0]);
    }
  }

  function handleValueChange(value: string) {
    setVal(value);
    onValueChange(value);
  }

  return (
    <div>
      <span>{label}</span>
      <select
        value={val}
        onChange={(event) => handleValueChange(event.target.value)}
      >
        {ids.map((id) => (
          <option value={id} key={id}>
            {id}
          </option>
        ))}
      </select>
    </div>
  );
}
