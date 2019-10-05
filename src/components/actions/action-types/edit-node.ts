import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionProperty,
  IActionType,
  IInput,
  IValidationResponse,
} from "../actions";

export interface IEditNodeAction {
  id: string;
  dx: number;
  dy: number;
}

export default class EditNode implements IActionFunctions {
  public properties = [
    { label: "id", type: IActionProperty.ID },
    { label: "dx", type: IActionProperty.NUM },
    { label: "dy", type: IActionProperty.NUM },
  ];

  public formElements: IInput[] = [
    { type: "number", id: "dx" },
    { type: "number", id: "dy" },
    { type: "id", id: "id" },
  ];

  public buttonText = "Edit Node";

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.payload as IEditNodeAction;
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [payload.id]: {
          ...state.nodes[payload.id],
          x: state.nodes[payload.id].x + payload.dx,
          y: state.nodes[payload.id].y + payload.dy,
        },
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = action.payload as IEditNodeAction;
    return {
      type: IActionType.EDIT_NODE,
      payload: {
        ...payload,
        dx: payload.dx * -1,
        dy: payload.dy * -1,
      },
    };
  }

  public validate(_state: IGraphState, _action: IAction): IValidationResponse {
    return {
      isValid: true,
    };
  }
}
