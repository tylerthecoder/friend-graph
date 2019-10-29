import { IEvent, IEventDiff, IGraphState } from "../../types";
import { applyAction, undoAction } from "../actions/actions";

export const emptyGraphState: IGraphState = {
  time: 0,
  connections: {},
  nodes: {},
};

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

interface EventDiffData {
  event: IEvent;
  diff: EventDiff;
}

export interface EventDiff {
  next: EventDiffData | null;
  prev: EventDiffData | null;
}

export function makeEventDiffList(events: IEvent[]): EventDiff {
  const eventDiffList: EventDiff = {
    next: null,
    prev: null,
  };

  let runner = eventDiffList;
  let prevRunner: EventDiff | null = null;

  let tempGraphState: IGraphState = emptyGraphState;
  let oldGraphState: IGraphState = emptyGraphState;

  for (let i = 0; i <= events.length; i++) {
    const event = events[i];
    const prevEvent = events[i - 1];
    if (prevEvent && prevRunner) {
      runner.prev = {
        diff: prevRunner,
        event: undoEvent(oldGraphState, prevEvent),
      };
      prevRunner.next = {
        diff: runner,
        event: { ...prevEvent },
      };
    }

    if (event) {
      oldGraphState = tempGraphState;
      tempGraphState = applyEvent(tempGraphState, event);
    }
    prevRunner = runner;
    runner = {
      next: null,
      prev: null,
    };
  }
  return eventDiffList;
}

export function applyEvent(state: IGraphState, event: IEvent): IGraphState {
  const newGraphState = event.actions.reduce(
    (state, action) => applyAction(state, action),
    { ...state },
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

export function findDiffByTime(
  state: IGraphState,
  diff: EventDiff,
  date: Date,
): [boolean, IGraphState, EventDiff] {
  const inputtedTime = date.getTime();
  const inputDateString = date.toDateString();
  const movingForward = inputtedTime > state.time;

  let lowDiff: EventDiff | null = movingForward
    ? diff.prev
      ? diff.prev.diff
      : null
    : diff;
  let highDiff: EventDiff | null = movingForward
    ? diff
    : diff.next
    ? diff.next.diff
    : null;

  const moveFunc = movingForward
    ? () => {
        if (highDiff && highDiff.next) {
          state = applyEvent(state, highDiff.next.event);
        } else {
          return false;
        }
        lowDiff = highDiff;
        highDiff = highDiff && highDiff.next ? highDiff.next.diff : null;
        return state.time < inputtedTime;
      }
    : () => {
        if (lowDiff && lowDiff.prev) {
          state = applyEvent(state, lowDiff.prev.event);
        } else {
          return false;
        }
        highDiff = lowDiff;
        lowDiff = lowDiff && lowDiff.prev ? lowDiff.prev.diff : null;
        return state.time > inputtedTime;
      };

  while (moveFunc()) {}

  if (new Date(state.time).toDateString() === inputDateString) {
    const newDiff = movingForward ? highDiff : lowDiff;
    if (!newDiff) {
      console.log("You should never see this");
    }
    return [true, state, newDiff!];
  }

  return [false, state, diff];
}
