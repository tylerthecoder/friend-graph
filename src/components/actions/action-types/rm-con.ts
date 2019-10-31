import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
  IFormData,
  IInput,
  IValidationResponse,
} from "../functions";

export interface IRmConAction {
  startId: string;
  endId: string;
}

export default class RmCon implements IActionFunctions {
  public properties = [
    { label: "startId", type: IActionProperty.ID },
    { label: "endId", type: IActionProperty.ID },
  ];

  public formElements: IInput[] = [
    { type: "id", id: "startId" },
    { type: "id", id: "endId" },
  ];

  public buttonText = "Remove Connection";

  public formToAction(data: IFormData) {
    return {
      startId: data.startId,
      endId: data.endId,
    };
  }

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
      ...action,
      type: IActionType.ADD_CON,
      payload: {
        ...connection,
        ...payload,
      },
    };
  }

  public validate(
    _state: IGraphState,
    _action: IActionPayload,
  ): IValidationResponse {
    return {
      isValid: true,
    };
  }
}
