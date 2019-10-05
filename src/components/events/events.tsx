import React from "react";
import { IEvent, IEventDiff, IGraphState } from "../../types";
import "./events.css";
import { applyEvent, calculateEventDiffs } from "./functions";

import eventData from "../../data/events.json";

const events = eventData as IEvent[];

export const initialEventDiffs = calculateEventDiffs(events);

interface Props {
  graphState: IGraphState;
  currentEventIndex: number;
  eventDiffs: IEventDiff[];
  onGraphStateChange: (state: IGraphState) => void;
  onIndexChange: (index: number) => void;
}

export default function Events(props: Props) {
  const {
    graphState,
    eventDiffs,
    currentEventIndex,
    onGraphStateChange,
    onIndexChange,
  } = props;

  function handleNext() {
    const event = eventDiffs[currentEventIndex];
    if (!event.next) {
      return;
    }

    const newGraphState = applyEvent(graphState, event.next);
    onGraphStateChange(newGraphState);
    onIndexChange(currentEventIndex + 1);
  }

  function handlePrevious() {
    const event = eventDiffs[currentEventIndex];
    if (!event.prev) {
      return;
    }

    const newGraphState = applyEvent(graphState, event.prev);
    onGraphStateChange(newGraphState);
    onIndexChange(currentEventIndex - 1);
  }

  return (
    <div id="events">
      <button onClick={handlePrevious}> Previous </button>
      <button onClick={handleNext}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
    </div>
  );
}
