import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionProperty,
  IActionType,
  IInput,
  IValidationResponse,
} from "../actions";

export interface IEditConnectionAction {
  startId: string;
  endId: string;
  dw: number;
}

export default class EditCon implements IActionFunctions {
  public properties = [
    { label: "startId", type: IActionProperty.ID },
    { label: "endId", type: IActionProperty.ID },
    { label: "dw", type: IActionProperty.NUM },
  ];

  public formElements: IInput[] = [
    { type: "id", id: "startId" },
    { type: "id", id: "endId" },
    { type: "number", id: "dw" },
  ];

  public buttonText = "Edit Connection";

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.payload as IEditConnectionAction;
    const id = `${payload.startId}:${payload.endId}`;
    return {
      ...state,
      connections: {
        ...state.connections,
        [id]: {
          ...state.connections[id],
          weight: state.connections[id].weight + payload.dw,
        },
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = action.payload as IEditConnectionAction;
    return {
      ...action,
      type: IActionType.EDIT_CON,
      payload: {
        ...payload,
        dw: payload.dw * -1,
      },
    };
  }

  public validate(state: IGraphState, action: IAction): IValidationResponse {
    return {
      isValid: true,
    };
  }
}
