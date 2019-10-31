import React, { useEffect, useState } from "react";
import { eventDiff } from "../../../testing/test-data";
import { IGraphState } from "../../../types";
import { IActionPayload, IActionType } from "../action-types/action-types";
import {
  getActionInputs,
  getButtonText,
  IFormData,
  IInput,
  validateAction,
} from "../functions";
import "./action-form.css";
import IdSelector from "./action-inputs/id-selector";
import ImgSelector from "./action-inputs/img-selector";
import NumberInput from "./action-inputs/number-input";
import PositionSelector from "./action-inputs/position-selector";
import TextInput from "./action-inputs/text-input";

interface Props {
  onSubmit: (formData: { [id: string]: any }) => void;
  shown: boolean;
  onOpen: () => void;
  graphState: IGraphState;
  actionType: IActionType;
}

export default function ActionForm(props: Props) {
  const { actionType, onOpen, graphState, shown, onSubmit } = props;
  const inputs = getActionInputs(actionType);
  const nodeIds = Object.values(graphState.nodes).map((node) => node.id);

  function getDefaultFormState(inputs: IInput[]): IFormData {
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

    return res;
  }

  const [formState, setFormState] = useState(getDefaultFormState(inputs));

  const buttonText = getButtonText(actionType);

  useEffect(() => {
    setFormState(getDefaultFormState(inputs));
  }, [graphState.nodes, inputs]);

  function setFormElementState(id: string, value: any) {
    setFormState({
      ...formState,
      [id]: value,
    });
  }

  function handleSubmitAction() {
    const validation = validateAction(
      graphState,
      actionType,
      formState as IActionPayload,
      eventDiff,
    );
    if (validation.isValid) {
      onSubmit(formState);
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
              {input.type === "id" ? (
                <IdSelector
                  ids={nodeIds}
                  label={input.id}
                  onValueChange={(val) => setFormElementState(input.id, val)}
                />
              ) : input.type === "img" ? (
                <ImgSelector
                  onValueChange={(val) => setFormElementState(input.id, val)}
                  label={input.id}
                />
              ) : input.type === "pos" ? (
                <PositionSelector
                  onValueChange={(val) => setFormElementState(input.id, val)}
                />
              ) : input.type === "text" ? (
                <TextInput
                  label={input.id}
                  onValueChange={(val) => setFormElementState(input.id, val)}
                />
              ) : (
                <NumberInput
                  label={input.id}
                  onValueChange={(val) => setFormElementState(input.id, val)}
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
