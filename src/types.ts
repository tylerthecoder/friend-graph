import { IAction } from "./components/actions/functions";

export interface INode {
  x: number;
  y: number;
  id: string;
  img: string;
}

export enum IConnectionType {
  FRIEND = "FRIEND",
  LIVES = "LIVES",
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

export interface IEventDiff {
  prev: IEvent | null;
  next: IEvent | null;
}
