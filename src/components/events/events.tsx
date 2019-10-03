import React, { useState } from "react";
import L621 from "../../img/621.png";
import Carter from "../../img/carter.jpg";
import Tyler from "../../img/tyler.jpg";
import Will from "../../img/will.jpg";
import { IConnectionType, IEvent, IEventDiff, IGraphState } from "../../types";
import { applyAction, IAction, IActionType } from "../actions/actions";
import ActionPanel from "../actions/actions-panel/actions-panel";
import { applyEvent, undoEvent } from "./functions";

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
        payload: { id: "tyler", x: 100, y: 100, img: Tyler },
      },
      {
        type: IActionType.ADD_NODE,
        payload: { id: "carter", x: 300, y: 300, img: Carter },
      },
    ],
  },
  {
    dTime: 86400000,
    actions: [
      {
        type: IActionType.ADD_CON,
        payload: {
          startId: "tyler",
          endId: "carter",
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
        payload: { id: "will", x: 100, y: 300, img: Will },
      },
      {
        type: IActionType.ADD_NODE,
        payload: { id: "621", x: 600, y: 300, img: L621 },
      },
    ],
  },
  {
    dTime: 86400000,
    actions: [
      {
        type: IActionType.EDIT_CON,
        payload: {
          startId: "tyler",
          endId: "carter",
          dw: 10,
        },
      },
      {
        type: IActionType.RM_NODE,
        payload: {
          id: "621",
        },
      },
    ],
  },
];

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
    const event = eventDiffs[currentEventIndex];
    if (!event.next) {
      return;
    }

    const newGraphState = applyEvent(event.next);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex + 1);
  }

  function handlePrevious() {
    const event = eventDiffs[currentEventIndex];
    if (!event.prev) {
      return;
    }

    const newGraphState = applyEvent(event.prev);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex - 1);
  }

  function handleNewAction(action: IAction) {
    // apply this action to the previous event (only do thin on index > 1)
    if (currentEventIndex === 0) {
      return;
    }

    console.log(action);

    const newGraphState = applyAction(graphState, action);
    updateGraphState(newGraphState);

    events[currentEventIndex - 1].actions.push(action);
  }

  return (
    <div id="events">
      <button onClick={handlePrevious}> Previous </button>
      <button onClick={handleNext}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
      <ActionPanel
        currentEvent={
          currentEventIndex - 1 === -1 ? null : events[currentEventIndex - 1]
        }
        onNewAction={handleNewAction}
      />
    </div>
  );
}
