import React, { useState } from "react";
import { IEvent, IGraphState } from "../../types";
import ActionPanel from "../actions/actions-panel/actions-panel";
import { applyEvent, calculateEventDiffs } from "./functions";

import eventData from "../../events.json";

export const emptyGraphState: IGraphState = {
  time: 0,
  connections: {},
  nodes: {},
};

const events = eventData as IEvent[];

const initialEventDiffs = calculateEventDiffs(events);

console.log(initialEventDiffs);

interface Props {
  onEventChange: (state: IGraphState) => void;
}

export default function Events(props: Props) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [graphState, setGraphState] = useState(emptyGraphState);
  const [eventDiffs, setEventDiffs] = useState(initialEventDiffs);

  function updateGraphState(state: IGraphState) {
    console.log("Graph State", state);
    setGraphState(state);
    props.onEventChange(state);
  }

  function handleNext() {
    const event = eventDiffs[currentEventIndex];
    if (!event.next) {
      return;
    }

    const newGraphState = applyEvent(graphState, event.next);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex + 1);
  }

  function handlePrevious() {
    const event = eventDiffs[currentEventIndex];
    if (!event.prev) {
      return;
    }

    const newGraphState = applyEvent(graphState, event.prev);
    updateGraphState(newGraphState);
    setCurrentEventIndex(currentEventIndex - 1);
  }

  return (
    <div id="events">
      <button onClick={handlePrevious}> Previous </button>
      <button onClick={handleNext}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
      <ActionPanel
        eventDiffs={eventDiffs}
        currentEventIndex={currentEventIndex}
        graphState={graphState}
        onNewGraphState={updateGraphState}
        onNewEventDiffList={setEventDiffs}
      />
    </div>
  );
}
