import { IEvent, IEventDiff, IGraphState } from "../../types";
import { applyAction, undoAction } from "../actions/actions";
import { emptyGraphState } from "./events";

export function calculateEventDiffs(events: IEvent[]): IEventDiff[] {
  const eventDiffs: IEventDiff[] = [];

  let tempGraphState: IGraphState = emptyGraphState;
  let oldGraphState: IGraphState = emptyGraphState;

  for (let i = 0; i <= events.length; i++) {
    const diff: IEventDiff = { prev: null, next: null };

    if (events[i - 1]) {
      const event = events[i - 1];
      diff.prev = undoEvent(oldGraphState, event);
    }

    if (events[i]) {
      const event = events[i];
      diff.next = { ...event };

      // now apply all of the actions to the graphState
      oldGraphState = tempGraphState;
      tempGraphState = applyEvent(tempGraphState, event);
    }

    eventDiffs.push(diff);
  }

  return eventDiffs;
}

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
