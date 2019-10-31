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

  public formToAction(data: IFormData) {
    return {
      startId: data.startId,
      endId: data.endId,
      dw: data.dw,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = this.getPayload(action);
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
    const payload = this.getPayload(action);
    return {
      ...action,
      type: IActionType.EDIT_CON,
      payload: {
        ...payload,
        dw: payload.dw * -1,
      },
    };
  }

  public validate(
    state: IGraphState,
    data: IActionPayload,
  ): IValidationResponse {
    const { startId, endId } = data as IEditConnectionAction;
    if (state.connections[`${startId}:${endId}`]) {
      return {
        isValid: true,
      };
    } else {
      return {
        isValid: false,
        message: "Connection does not exist",
      };
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IEditConnectionAction;
  }
}
