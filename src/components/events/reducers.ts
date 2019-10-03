import {
  IAction,
  IActionType,
  IAddConnectionAction,
  IAddNodeAction,
  IEditConnectionAction,
  IEditNodeAction,
  IGraphState,
  IRmConnectionAction,
  IRmNodeAction,
} from "../../types";
import { emptyGraphState } from "./events";

export function addNode(
  state: IGraphState,
  payload: IAddNodeAction,
): IGraphState {
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [payload.id]: payload,
    },
  };
}

export function editNode(state: IGraphState, payload: IEditNodeAction) {
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

export function rmNode(
  state: IGraphState,
  payload: IRmNodeAction,
): IGraphState {
  const newState = {
    ...state,
    nodes: { ...state.nodes },
  };
  delete newState.nodes[payload.id];
  return newState;
}

export function addConnection(
  state: IGraphState,
  payload: IAddConnectionAction,
): IGraphState {
  return {
    ...state,
    connections: {
      ...state.connections,
      [`${payload.startId}:${payload.endId}`]: payload,
    },
  };
}

export function editConnection(
  state: IGraphState,
  payload: IEditConnectionAction,
): IGraphState {
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

export function rmConnection(state: IGraphState, payload: IRmConnectionAction) {
  const newState = { ...state, connections: { ...state.connections } };
  delete newState.connections[`${payload.startId}:${payload.endId}`];
  return newState;
}

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  switch (action.type) {
    case IActionType.ADD_NODE:
      return addNode(state, action.payload as IAddNodeAction);
    case IActionType.EDIT_NODE:
      return editNode(state, action.payload as IEditNodeAction);
    case IActionType.RM_NODE:
      return rmNode(state, action.payload as IRmNodeAction);
    case IActionType.ADD_CON:
      return addConnection(state, action.payload as IAddConnectionAction);
    case IActionType.EDIT_CON:
      return editConnection(state, action.payload as IEditConnectionAction);
    case IActionType.RM_CON:
      return rmConnection(state, action.payload as IRmConnectionAction);
    // Should never get here
    default:
      return emptyGraphState;
  }
}
