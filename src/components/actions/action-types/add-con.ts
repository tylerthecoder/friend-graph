import { IConnectionType, IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IAddConnectionAction {
  startId: string;
  endId: string;
  weight: number;
  type: IConnectionType;
}

export const formElements: IInput[] = [
  { type: "text", id: "startId" },
  { type: "text", id: "endId" },
  { type: "number", id: "weight" },
  { type: "number", id: "type" },
];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  const payload = action.payload as IAddConnectionAction;
  return {
    ...state,
    connections: {
      ...state.connections,
      [`${payload.startId}:${payload.endId}`]: payload,
    },
  };
}

export function undoAction(_prevState: IGraphState, action: IAction): IAction {
  const payload = action.payload as IAddConnectionAction;
  return {
    type: IActionType.RM_CON,
    payload: {
      startId: payload.startId,
      endId: payload.endId,
    },
  };
}
