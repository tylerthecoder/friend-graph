import { IGraphState } from "../../../../types";
import { EventDiff } from "../../../events/functions";
import {
  IAction,
  IFormData,
  IInput,
  IValidationResponse,
} from "../../functions";
import {
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
} from "../action-types";

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
    _action: IActionPayload,
    _state: IGraphState,
    _diff: EventDiff,
  ): IValidationResponse {
    return {
      isValid: true,
    };
  }
}
