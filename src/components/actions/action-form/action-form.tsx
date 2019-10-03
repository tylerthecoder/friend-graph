import React, { useState } from "react";
import { IAction, IActionType, IEventPayload } from "../../../types";
import { getActionInputs, IInput } from "../actions";

interface Props {
  onAction: (action: IAction) => void;
  actionType: IActionType;
  buttonText: string;
}

function getDefaultFormState(inputs: IInput[]): { [id: string]: any } {
  const res: { [id: string]: any } = {};
  inputs.forEach((input) => {
    let defaultVal: any;
    switch (input.type) {
      case "number":
        defaultVal = 0;
        break;
      case "text":
        defaultVal = "";
        break;
      default:
        defaultVal = undefined;
    }
    res[input.id] = defaultVal;
  });
  return res;
}

export default function ActionForm(props: Props) {
  const { buttonText, actionType, onAction } = props;
  const inputs = getActionInputs(actionType);
  const [formState, setFormState] = useState(getDefaultFormState(inputs));

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let value: number | string;
    if (event.target.type === "number") {
      value = Number(event.target.value);
    } else {
      value = event.target.value;
    }
    const newState = {
      ...formState,
      [event.target.id]: value,
    };
    setFormState(newState);
  }

  function handleSubmitAction() {
    onAction({
      type: actionType,
      payload: formState as IEventPayload,
    });
  }

  return (
    <div>
      {inputs.map((input) => (
        <div key={input.id}>
          <span> {input.id} </span>
          <input
            id={input.id}
            type={input.type}
            onChange={handleChange}
            value={formState[input.id]}
          />
        </div>
      ))}
      <button onClick={handleSubmitAction}>{buttonText}</button>
    </div>
  );
}
