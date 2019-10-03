import { IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IEditNodeAction {
  id: string;
  dx: number;
  dy: number;
}

export const formElements: IInput[] = [
  { type: "number", id: "dx" },
  { type: "number", id: "dy" },
  { type: "text", id: "id" },
];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
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

export function undoAction(_prevState: IGraphState, action: IAction): IAction {
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
