import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
  IInput,
  IValidationResponse,
} from "../actions";

export interface IAddNodeAction {
  id: string;
  img: string;
  x: number;
  y: number;
}

export default class AddNode implements IActionFunctions {
  public properties = [
    { label: "id", type: IActionProperty.ID },
    { label: "img", type: IActionProperty.IMG },
    { label: "x", type: IActionProperty.NUM },
    { label: "y", type: IActionProperty.NUM },
  ];

  public formElements: IInput[] = [
    { type: "pos", id: "pos" },
    { type: "img", id: "img" },
    { type: "text", id: "id" },
  ];

  public buttonText = "Add Node";

  public formToAction(data: { [id: string]: any }): IAddNodeAction {
    return {
      id: data.id,
      img: data.img,
      x: data.pos.x,
      y: data.pos.y,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = this.getPayload(action);
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [payload.id]: payload,
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = this.getPayload(action);
    return {
      ...action,
      type: IActionType.RM_NODE,
      payload: {
        id: payload.id,
      },
    };
  }

  public validate(
    state: IGraphState,
    data: IActionPayload,
  ): IValidationResponse {
    const payload = data as IAddNodeAction;
    const condition = Object.values(state.nodes).every(
      (node) => node.id !== payload.id,
    );
    if (condition) {
      return {
        isValid: true,
      };
    } else {
      return {
        isValid: false,
        message: "Id already exists",
      };
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IAddNodeAction;
  }
}
