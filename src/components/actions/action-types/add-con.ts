import { IConnectionType, IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionProperty,
  IActionType,
  IInput,
  IValidationResponse,
} from "../actions";

export interface IAddConnectionAction {
  startId: string;
  endId: string;
  weight: number;
  type: IConnectionType;
}

export default class AddCon implements IActionFunctions {
  public properties = [
    { label: "startId", type: IActionProperty.ID },
    { label: "endId", type: IActionProperty.ID },
    { label: "weight", type: IActionProperty.NUM },
    { label: "type", type: IActionProperty.CONNECTION_TYPE },
  ];

  public formElements: IInput[] = [
    { type: "id", id: "startId" },
    { type: "id", id: "endId" },
    { type: "number", id: "weight" },
    { type: "number", id: "type" },
  ];

  public buttonText = "Add Connection";

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = this.getPayload(action);
    return {
      ...state,
      connections: {
        ...state.connections,
        [`${payload.startId}:${payload.endId}`]: payload,
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = this.getPayload(action);
    return {
      ...action,
      type: IActionType.RM_CON,
      payload: {
        startId: payload.startId,
        endId: payload.endId,
      },
    };
  }

  public validate(_state: IGraphState, action: IAction): IValidationResponse {
    const payload = this.getPayload(action);
    if (payload.startId === payload.endId) {
      return {
        isValid: false,
        message: "StartId can't equal EndId",
      };
    } else {
      return {
        isValid: true,
      };
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IAddConnectionAction;
  }
}