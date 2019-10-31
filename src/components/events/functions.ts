import { IEvent, IEventDiff, IGraphState } from "../../types";
import { applyAction, undoAction } from "../actions/functions";

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

export function moveToNextEvent(
  state: IGraphState,
  eventDiff: EventDiff,
): [IGraphState, EventDiff] {
  if (eventDiff.next) {
    state = applyEvent(state, eventDiff.next.event);
    eventDiff = eventDiff.next.diff;
  }
  return [state, eventDiff];
}

export function moveToPrevEvent(
  state: IGraphState,
  eventDiff: EventDiff,
): [IGraphState, EventDiff] {
  if (eventDiff.prev) {
    state = applyEvent(state, eventDiff.prev.event);
    eventDiff = eventDiff.prev.diff;
  }
  return [state, eventDiff];
}

// this function takes in the current GS, the current event diff, and a desired time
// and returns either the diff and GS where the GS time is the desired time,
// or if that doesn't exist, it returns the diff and GS right before that time.
// if the chosen time is before the beginning of time,
// it will just return the GS of the beginning of time
export function moveToTime(
  state: IGraphState,
  diff: EventDiff,
  time: number,
): [boolean, IGraphState, EventDiff] {
  const inputDateString = new Date(time).toDateString();
  const movingForward = time > state.time;

  if (new Date(state.time).toDateString() === inputDateString) {
    return [true, state, diff];
  }

  if (time < 0) {
    return [false, state, diff];
  }

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

  const moveCondition: () => boolean = movingForward
    ? () => {
        // add the next time to the current time so we don't go over
        return (
          Boolean(highDiff && highDiff.next) &&
          state.time +
            (highDiff && highDiff.next ? highDiff.next.event.dTime : 0) <=
            time
        );
      }
    : () => {
        return Boolean(lowDiff && lowDiff.prev) && state.time > time;
      };

  const moveFunc = movingForward
    ? () => {
        if (highDiff && highDiff.next) {
          state = applyEvent(state, highDiff.next.event);
          lowDiff = highDiff;
          highDiff = highDiff && highDiff.next ? highDiff.next.diff : null;
        }
      }
    : () => {
        if (lowDiff && lowDiff.prev) {
          state = applyEvent(state, lowDiff.prev.event);
          highDiff = lowDiff;
          lowDiff = lowDiff && lowDiff.prev ? lowDiff.prev.diff : null;
        }
      };

  while (moveCondition()) {
    moveFunc();
  }

  const newDiff = movingForward ? highDiff : lowDiff;

  if (!newDiff) {
    console.log("You should never see this");
  }

  if (new Date(state.time).toDateString() === inputDateString) {
    return [true, state, newDiff!];
  } else {
    return [false, state, newDiff!];
  }
}

export function addGhostNode(
  graphState: IGraphState,
  eventDiff: EventDiff,
  time: number,
): [IGraphState, EventDiff] {
  const lowDiff = eventDiff;
  const highDiff = eventDiff.next ? eventDiff.next.diff : null;

  const lowTime = graphState.time;
  const highTime =
    graphState.time + (lowDiff.next ? lowDiff.next.event.dTime : 0);

  const ghostDiff: EventDiff = {
    next: null,
    prev: null,
  };

  if (highDiff) {
    ghostDiff.next = {
      event: {
        actions: lowDiff.next ? lowDiff.next.event.actions : [],
        dTime: highTime - time,
      },
      diff: highDiff,
    };
    highDiff.prev = {
      event: {
        actions: highDiff.prev ? highDiff.prev.event.actions : [],
        dTime: time - highTime,
      },
      diff: ghostDiff,
    };
  }

  ghostDiff.prev = {
    event: {
      actions: [],
      dTime: lowTime - time,
    },
    diff: lowDiff,
  };
  lowDiff.next = {
    event: {
      actions: [],
      dTime: time - lowTime,
    },
    diff: ghostDiff,
  };

  const newGraphState = applyEvent(graphState, lowDiff.next.event);

  return [newGraphState, ghostDiff];
}

export function bustGhost(
  GS: IGraphState,
  ED: EventDiff,
): [boolean, IGraphState, EventDiff] {
  if (ED.prev && ED.prev.event.actions.length === 0) {
    // time to delete the ghost node
    const prevDiff = ED.prev.diff;
    const nextDiff = ED.next ? ED.next.diff : null;

    if (!nextDiff) {
      prevDiff.next = null;
      GS.time += ED.prev.event.dTime;
      return [true, GS, prevDiff];
    }

    prevDiff.next = {
      diff: nextDiff,
      event: {
        actions: ED.next!.event.actions,
        dTime: ED.next!.event.dTime + -ED.prev.event.dTime,
      },
    };

    nextDiff.prev = {
      diff: prevDiff,
      event: {
        actions: nextDiff.prev!.event.actions,
        dTime: -ED.next!.event.dTime + ED.prev.event.dTime,
      },
    };

    GS.time += ED.prev.event.dTime;

    return [true, GS, prevDiff];
  }

  return [false, GS, ED];
}
