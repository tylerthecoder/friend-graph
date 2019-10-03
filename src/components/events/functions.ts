import { IEvent, IGraphState } from "../../types";
import { applyAction, undoAction } from "../actions/actions";

export function applyEvent(state: IGraphState, event: IEvent): IGraphState {
  const newGraphState = event.actions.reduce(
    (state, action) => applyAction(state, action),
    state,
  );
  newGraphState.time += event.dTime;
  return newGraphState;
}

export function undoEvent(prevState: IGraphState, event: IEvent): IEvent {
  return {
    dTime: event.dTime * -1,
    actions: event.actions.map((action) => undoAction(prevState, action)),
  };
}
