import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionType,
  IInput,
  IValidationResponse,
  IActionProperty,
} from "../actions";

export interface IRmConAction {
  startId: string;
  endId: string;
}

export default class RmCon implements IActionFunctions {
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

  public buttonText = "Remove Connection";

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.payload as IRmConAction;
    const id = `${payload.startId}:${payload.endId}`;
    const newState = {
      ...state,
      connections: {
        ...state.connections,
      },
    };
    delete newState.connections[id];
    return newState;
  }

  public undoAction(prevState: IGraphState, action: IAction): IAction {
    const payload = action.payload as IRmConAction;
    const id = `${payload.startId}:${payload.endId}`;
    const connection = prevState.connections[id];
    return {
      type: IActionType.ADD_CON,
      payload: {
        ...connection,
        ...payload,
      },
    };
  }

  public validate(_state: IGraphState, _action: IAction): IValidationResponse {
    return {
      isValid: true,
    };
  }
}