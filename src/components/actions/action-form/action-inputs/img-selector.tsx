import React, { useState } from "react";
import imgs from "../../../../data/imgs.json";

interface Props {
  onValueChange: (id: string) => void;
  label: string;
}

export default function ImgSelector(props: Props) {
  const { onValueChange, label } = props;
  const [val, setVal] = useState("");

  const imgValues = Object.values(imgs).map((img) => img.url);

  if (imgValues.indexOf(val) === -1 && val !== "") {
    if (imgs.length === 0) {
      handleValueChange("");
    } else {
      handleValueChange(imgValues[0]);
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
        {Object.values(imgs).map((img) => (
          <option value={img.url} key={img.url}>
            {img.name}
          </option>
        ))}
      </select>
    </div>
  );
}
