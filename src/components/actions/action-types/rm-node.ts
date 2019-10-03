import { IGraphState } from "../../../types";
import { IAction, IActionType, IInput } from "../actions";

export interface IRmNodeAction {
  id: string;
}

export const formElements: IInput[] = [{ type: "text", id: "id" }];

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  const payload = action.payload as IRmNodeAction;
  const newState = {
    ...state,
    nodes: { ...state.nodes },
  };
  delete newState.nodes[payload.id];
  return newState;
}

// this is incorrect, maybe pass in the previous graphState and do the {prev, next} thing again
export function undoAction(prevState: IGraphState, action: IAction): IAction {
  const payload = action.payload as IRmNodeAction;
  const node = prevState.nodes[payload.id];
  return {
    type: IActionType.ADD_NODE,
    payload: {
      ...node,
      id: payload.id,
    },
  };
}
