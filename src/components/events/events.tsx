import React, { useState } from "react";
import Carter from "../../img/carter.jpg";
import Tyler from "../../img/tyler.jpg";
import Will from "../../img/will.jpg";
import {
  IActionType,
  IConnectionType,
  IDiffEventList,
  IEvent,
  IGraphState,
} from "../../types";
import { applyAction } from "./reducers";
import undoAction from "./undoers";

export const emptyGraphState: IGraphState = {
  time: 0,
  connections: {},
  nodes: {},
};

const events: IEvent[] = [
  {
    dTime: 1496293200000,
    actions: [
      {
        type: IActionType.ADD_NODE,
        payload: { id: "Tyler", x: 100, y: 100, img: Tyler },
      },
      {
        type: IActionType.ADD_NODE,
        payload: { id: "Carter", x: 300, y: 300, img: Carter },
      },
    ],
  },
  {
    dTime: 86400000,
    actions: [
      {
        type: IActionType.ADD_CON,
        payload: {
          startId: "Tyler",
          endId: "Carter",
          weight: 10,
          type: IConnectionType.FRIEND,
        },
      },
    ],
  },
  {
    dTime: 86400000,
    actions: [
      {
        type: IActionType.ADD_NODE,
        payload: { id: "Will", x: 100, y: 300, img: Will },
      },
    ],
  },
  {
    dTime: 86400000,
    actions: [
      {
        type: IActionType.EDIT_CON,
        payload: {
          startId: "Tyler",
          endId: "Carter",
          dw: 10,
        },
      },
    ],
  },
];

// process all of the events
const eventDiffs: IDiffEventList = [];

for (let i = 0; i < events.length + 1; i++) {
  // calculate how to get to events[i-1] from events[i]
  let prevDiff: IEvent | null = null;
  if (events[i - 1]) {
    const event = events[i - 1];
    prevDiff = {
      dTime: event.dTime * -1,
      actions: event.actions.map(undoAction),
    };
  }

  // calculate how to get to events[i-1] from events[i]
  let nextDiff: IEvent | null = null;
  if (events[i]) {
    const event = events[i];
    nextDiff = { ...event };
  }

  eventDiffs.push({
    prev: prevDiff,
    next: nextDiff,
  });
}

console.log(eventDiffs);

interface Props {
  onEventChange: (state: IGraphState) => void;
}

export default function Events(props: Props) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [graphState, setGraphState] = useState(emptyGraphState);

  function updateGraphState(state: IGraphState) {
    console.log(state);
    setGraphState(state);
    props.onEventChange(state);
  }

  function applyEvent(event: IEvent) {
    const newGraphState = event.actions.reduce(
      (state, action) => applyAction(state, action),
      graphState,
    );
    newGraphState.time += event.dTime;
    return newGraphState;
  }

  function handleNext() {
    const event: IEvent | null = eventDiffs[currentEventIndex].next;
    if (event === null) {
      return;
    }

    const newGraphState = applyEvent(event);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex + 1);
  }

  function handlePrevious() {
    const event: IEvent | null = eventDiffs[currentEventIndex].prev;
    if (event === null) {
      return;
    }

    const newGraphState = applyEvent(event);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex - 1);
  }

  return (
    <div id="events">
      <button onClick={handlePrevious}> Previous </button>
      <button onClick={handleNext}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
    </div>
  );
}
