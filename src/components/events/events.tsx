import React from "react";
import eventData from "../../data/events.json";
import { IEvent, IEventDiff, IGraphState } from "../../types";
import "./events.css";
import {
  applyEvent,
  calculateEventDiffs,
  EventDiff,
  makeEventDiffList,
} from "./functions";

const events = eventData as IEvent[];
export const initialEventDiffs = calculateEventDiffs(events);
export const initialEventDiffList = makeEventDiffList(events);

function toDateInputValue(d: number) {
  const date = new Date(d);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toJSON().slice(0, 10);
}

interface Props {
  graphState: IGraphState;
  eventDiffs: IEventDiff[];
  eventDiff: EventDiff;
  onGraphStateChange: (state: IGraphState) => void;
  onEventDiffChange: (diffs: IEventDiff[]) => void;
  onEventDiffChange2: (diff: EventDiff) => void;
  onDateChange: (date: number) => void;
}

export default function Events(props: Props) {
  const {
    graphState,
    eventDiff,
    onGraphStateChange,
    onEventDiffChange2,
  } = props;

  // using event diff list
  function nextEvent() {
    let [newEventDiff, newGraphState] = handleGhostNode();
    if (newEventDiff.next) {
      newGraphState = applyEvent(graphState, newEventDiff.next.event);
      newEventDiff = newEventDiff.next.diff;
    }
    onEventDiffChange2(newEventDiff);
    onGraphStateChange(newGraphState);
  }

  function prevEvent() {
    let [newEventDiff, newGraphState] = handleGhostNode();
    if (newEventDiff.prev) {
      newGraphState = applyEvent(graphState, newEventDiff.prev.event);
      newEventDiff = newEventDiff.prev.diff;
    }
    onEventDiffChange2(newEventDiff);
    onGraphStateChange(newGraphState);
  }

  function handleGhostNode(): [EventDiff, IGraphState] {
    if (eventDiff.prev && eventDiff.prev.event.actions.length === 0) {
      console.log("It was a ghost");
      // time to delete the ghost node
      const prevDiff = eventDiff.prev.diff;
      const nextDiff = eventDiff.next ? eventDiff.next.diff : null;

      if (!nextDiff) {
        prevDiff.next = null;
        return [prevDiff, graphState];
      }

      prevDiff.next = {
        diff: nextDiff,
        event: {
          actions: eventDiff.next!.event.actions,
          dTime: eventDiff.next!.event.dTime + -eventDiff.prev.event.dTime,
        },
      };

      nextDiff.prev = {
        diff: prevDiff,
        event: {
          actions: nextDiff.prev!.event.actions,
          dTime: -eventDiff.next!.event.dTime + eventDiff.prev.event.dTime,
        },
      };

      graphState.time += eventDiff.prev.event.dTime;

      return [prevDiff, graphState];
    }

    return [eventDiff, graphState];
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [year, month, day] = event.target.value.split("-");
    const dateString = `${month}/${day}/${year}`;
    const inputtedTime = new Date(dateString).getTime();
    const inputDateString = new Date(dateString).toDateString();

    let [newEventDiff, newGraphState] = handleGhostNode();

    if (new Date(newGraphState.time).toDateString() === inputDateString) {
      onGraphStateChange(newGraphState);
      onEventDiffChange2(newEventDiff);
      return;
    }

    const movingForward = inputtedTime > graphState.time;

    let lowDiff: EventDiff | null = movingForward
      ? newEventDiff.prev
        ? newEventDiff.prev.diff
        : null
      : newEventDiff;
    let highDiff: EventDiff | null = movingForward
      ? newEventDiff
      : newEventDiff.next
      ? newEventDiff.next.diff
      : null;

    const moveFunc = movingForward
      ? () => {
          if (highDiff && highDiff.next) {
            newGraphState = applyEvent(newGraphState, highDiff.next.event);
          } else {
            return false;
          }
          lowDiff = highDiff;
          highDiff = highDiff && highDiff.next ? highDiff.next.diff : null;
          return newGraphState.time < inputtedTime;
        }
      : () => {
          if (lowDiff && lowDiff.prev) {
            newGraphState = applyEvent(newGraphState, lowDiff.prev.event);
          } else {
            return false;
          }
          highDiff = lowDiff;
          lowDiff = lowDiff && lowDiff.prev ? lowDiff.prev.diff : null;
          return newGraphState.time > inputtedTime;
        };

    while (moveFunc()) {}

    if (new Date(newGraphState.time).toDateString() === inputDateString) {
      onGraphStateChange(newGraphState);

      const newDiff = movingForward ? highDiff : lowDiff;
      if (!newDiff) {
        console.log("You should never see this");
      }
      onEventDiffChange2(newDiff!);
      return;
    }

    // if we went forward then we need to move the diffs back one
    if (movingForward && highDiff && highDiff.prev && highDiff.next) {
      newGraphState = applyEvent(newGraphState, highDiff.prev.event);
    } else if (movingForward) {
      console.log("Don't know what to do here");
      // this means we were on an outer edge
    }

    // Past here is ghost stuff
    const lowTime = newGraphState.time;
    const highTime =
      newGraphState.time +
      (lowDiff && lowDiff.next ? lowDiff.next.event.dTime : 0);

    // these should never be null I guess
    if (!lowDiff || !highDiff) {
      return;
    }

    // need to see if we are past the first or last node

    if (inputtedTime > highTime) {
      highDiff = highDiff.next ? highDiff.next.diff : null;
      lowDiff = lowDiff.next ? lowDiff.next.diff : null;
    } else if (inputtedTime < lowTime) {
      highDiff = highDiff.prev ? highDiff.prev.diff : null;
      lowDiff = lowDiff.prev ? lowDiff.prev.diff : null;
    }

    const ghostDiff: EventDiff = {
      next: null,
      prev: null,
    };

    if (highDiff) {
      ghostDiff.next = {
        event: {
          actions: lowDiff && lowDiff.next ? lowDiff.next.event.actions : [],
          dTime: highTime - inputtedTime,
        },
        diff: highDiff,
      };
      highDiff.prev = {
        event: {
          actions: highDiff.prev ? highDiff.prev.event.actions : [],
          dTime: inputtedTime - highTime,
        },
        diff: ghostDiff,
      };
    }

    if (lowDiff) {
      ghostDiff.prev = {
        event: {
          actions: [],
          dTime: lowTime - inputtedTime,
        },
        diff: lowDiff,
      };
      lowDiff.next = {
        event: {
          actions: [],
          dTime: inputtedTime - lowTime,
        },
        diff: ghostDiff,
      };
    }

    // apply the diff we just made
    if (lowDiff && lowDiff.next) {
      newGraphState = applyEvent(newGraphState, lowDiff.next.event);
    } else if (highDiff && highDiff.prev) {
      newGraphState = applyEvent(newGraphState, highDiff.prev.event);
    }

    onGraphStateChange(newGraphState);
    onEventDiffChange2(ghostDiff);
  }

  return (
    <div id="events">
      <button onClick={prevEvent}>Previous</button>
      <button onClick={nextEvent}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
      <input
        type="date"
        value={toDateInputValue(graphState.time)}
        onChange={handleTimeChange}
      />
    </div>
  );
}
