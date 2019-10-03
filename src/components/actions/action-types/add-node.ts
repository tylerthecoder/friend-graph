import { IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IAddNodeAction {
  id: string;
  img: string;
  x: number;
  y: number;
}

export const formElements: IInput[] = [
  { type: "number", id: "x" },
  { type: "number", id: "y" },
  { type: "text", id: "img" },
  { type: "text", id: "id" },
];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  const payload = action.payload as IAddNodeAction;
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [payload.id]: payload,
    },
  };
}

export function undoAction(_prevState: IGraphState, action: IAction): IAction {
  const payload = action.payload as IAddNodeAction;
  return {
    type: IActionType.RM_NODE,
    payload: {
      id: payload.id,
    },
  };
}
