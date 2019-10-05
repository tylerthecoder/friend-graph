import { IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
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
    { type: "number", id: "x" },
    { type: "number", id: "y" },
    { type: "img", id: "img" },
    { type: "text", id: "id" },
  ];

  public buttonText = "Add Node";

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.payload as IAddNodeAction;
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [payload.id]: payload,
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = action.payload as IAddNodeAction;
    return {
      type: IActionType.RM_NODE,
      payload: {
        id: payload.id,
      },
    };
  }

  public validate(state: IGraphState, action: IAction): IValidationResponse {
    const payload = action.payload as IAddNodeAction;
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
}
