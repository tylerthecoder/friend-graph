import { IConnectionType, IGraphState } from "../../../../types";
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

  public formToAction(data: IFormData) {
    return {
      startId: data.startId,
      endId: data.endId,
      weight: data.weight,
      type: data.type,
    };
  }

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

  public validate(
    data: IActionPayload,
    _state: IGraphState,
    _diff: EventDiff,
  ): IValidationResponse {
    const payload = this.payloadCast(data);
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

  private payloadCast(payload: any) {
    return payload as IAddConnectionAction;
  }
}
