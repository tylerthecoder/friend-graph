import { IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IEditConnectionAction {
  startId: string;
  endId: string;
  dw: number;
}

export const formElements: IInput[] = [
  { type: "text", id: "startId" },
  { type: "text", id: "endId" },
  { type: "number", id: "dw" },
];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  const payload = action.payload as IEditConnectionAction;
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

export function undoAction(_prevState: IGraphState, action: IAction): IAction {
  const payload = action.payload as IEditConnectionAction;
  return {
    type: IActionType.EDIT_CON,
    payload: {
      ...payload,
      dw: payload.dw * -1,
    },
  };
}
