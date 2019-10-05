import React, { useEffect, useState } from "react";
import imgs from "../../../data/imgs.json";
import { IGraphState } from "../../../types";
import {
  getActionInputs,
  getButtonText,
  IAction,
  IActionPayload,
  IActionType,
  IInput,
  validateAction,
} from "../actions";
import "./action-form.css";

interface Props {
  onAction: (action: IAction) => void;
  shown: boolean;
  onOpen: () => void;
  graphState: IGraphState;
  actionType: IActionType;
}

export default function ActionForm(props: Props) {
  const { actionType, onAction, onOpen, graphState, shown } = props;
  const inputs = getActionInputs(actionType);
  const nodeIds = Object.values(graphState.nodes).map((node) => node.id);

  function getDefaultFormState(inputs: IInput[]): { [id: string]: any } {
    const res: { [id: string]: any } = {};
    inputs.forEach((input) => {
      let defaultVal: any;
      switch (input.type) {
        case "number":
          defaultVal = 0;
          break;
        case "text":
        case "img":
        case "id":
          defaultVal = "";
          break;
        default:
          defaultVal = undefined;
      }
      res[input.id] = defaultVal;
    });

    inputs
      .filter((input) => input.type === "id")
      .forEach((input) => {
        res[input.id] = nodeIds[0];
      });

    inputs
      .filter((input) => input.type === "img")
      .forEach((input) => (res[input.id] = imgs[0].name));

    return res;
  }

  const [formState, setFormState] = useState(getDefaultFormState(inputs));

  const buttonText = getButtonText(actionType);

  useEffect(() => {
    setFormState(getDefaultFormState(inputs));
  }, [graphState.nodes, inputs]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
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
    const action = {
      type: actionType,
      payload: formState as IActionPayload,
    };

    const validation = validateAction(graphState, action);
    if (validation.isValid) {
      onAction(action);
    } else {
      alert(validation.message);
    }
  }

  return (
    <div className="action-form">
      {shown ? (
        <div className="form-content">
          <p>{buttonText}</p>
          {inputs.map((input) => (
            <div key={input.id}>
              <span> {input.id} </span>
              {input.type === "id" ? (
                <select
                  id={input.id}
                  onChange={handleChange}
                  value={formState[input.id]}
                >
                  {nodeIds.map((id) => (
                    <option key={id}>{id}</option>
                  ))}
                </select>
              ) : input.type === "img" ? (
                <select
                  id={input.id}
                  onChange={handleChange}
                  value={formState[input.id]}
                >
                  {imgs.map((img) => (
                    <option key={img.name} value={img.url}>
                      {img.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={input.id}
                  type={input.type}
                  onChange={handleChange}
                  value={formState[input.id]}
                />
              )}
            </div>
          ))}
          <button onClick={handleSubmitAction}>Apply</button>
        </div>
      ) : (
        <div className="collapsed" onClick={() => onOpen()}>
          <p>{buttonText}</p>
        </div>
      )}
    </div>
  );
}
