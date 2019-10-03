export interface INode {
  x: number;
  y: number;
  id: string;
  img: string;
}

export enum IConnectionType {
  FRIEND,
  LIVES,
}

export interface IConnection {
  startId: string;
  endId: string;
  weight: number;
  type: IConnectionType;
}

export interface IGraphState {
  time: number;
  connections: { [id: string]: IConnection };
  nodes: { [id: string]: INode };
}

/*==============
  Event Types
==============*/

export interface IEvent {
  dTime: number;
  actions: IAction[];
}

export interface IAction {
  type: IActionType;
  payload: IEventPayload;
}

export type IDiffEventList = Array<{
  prev: IEvent | null;
  next: IEvent | null;
}>;

export type IEventPayload =
  | IAddNodeAction
  | IRmNodeAction
  | IEditNodeAction
  | IAddConnectionAction
  | IRmConnectionAction
  | IEditConnectionAction;

export enum IActionType {
  ADD_NODE,
  RM_NODE,
  EDIT_NODE,
  ADD_CON,
  EDIT_CON,
  RM_CON,
}

export interface IAddNodeAction {
  id: string;
  img: string;
  x: number;
  y: number;
}

export interface IRmNodeAction {
  id: string;
}

export interface IEditNodeAction {
  id: string;
  dx: number;
  dy: number;
}

export interface IAddConnectionAction {
  startId: string;
  endId: string;
  weight: number;
  type: IConnectionType;
}

export interface IRmConnectionAction {
  startId: string;
  endId: string;
}

export interface IEditConnectionAction {
  startId: string;
  endId: string;
  dw: number;
}
