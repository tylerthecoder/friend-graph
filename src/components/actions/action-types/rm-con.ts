import { IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IRmConAction {
  startId: string;
  endId: string;
}

export const formElements: IInput[] = [
  { type: "text", id: "startId" },
  { type: "text", id: "endId" },
  { type: "number", id: "dw" },
];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
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

export function undoAction(prevState: IGraphState, action: IAction): IAction {
  const payload = action.payload as IRmConAction;
  const id = `${payload.startId}:${payload.endId}`;
  const connection = prevState.connections[id];
  return {
    type: IActionType.ADD_CON,
    payload: {
      ...connection,
      ...payload,
    },
  };
}
