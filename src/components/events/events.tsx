import React from "react";
import eventData from "../../data/events.json";
import { IEvent, IGraphState } from "../../types";
import "./events.css";
import {
  addGhostNode,
  bustGhost,
  calculateEventDiffs,
  EventDiff,
  makeEventDiffList,
  moveToNextEvent,
  moveToPrevEvent,
  moveToTime,
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
  eventDiff: EventDiff;
  onGraphStateChange: (state: IGraphState) => void;
  onEventDiffChange: (diff: EventDiff) => void;
}

export default function Events(props: Props) {
  const {
    graphState,
    eventDiff,
    onGraphStateChange,
    onEventDiffChange,
  } = props;

  // using event diff list
  function nextEvent() {
    let [_found, GS, ED] = bustGhost(graphState, eventDiff);
    [GS, ED] = moveToNextEvent(GS, ED);
    onGraphStateChange(GS);
    onEventDiffChange(ED);
  }

  function prevEvent() {
    let [foundGhost, GS, ED] = bustGhost(graphState, eventDiff);
    if (!foundGhost) {
      [GS, ED] = moveToPrevEvent(graphState, eventDiff);
    }
    onEventDiffChange(ED);
    onGraphStateChange(GS);
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [year, month, day] = event.target.value.split("-");
    const inputtedTime = new Date(`${month}/${day}/${year}`).getTime();

    let [found, GS, ED] = bustGhost(graphState, eventDiff);
    [found, GS, ED] = moveToTime(GS, ED, inputtedTime);

    // The user didn't click on a date that is defined
    if (!found) {
      [GS, ED] = addGhostNode(GS, ED, inputtedTime);
    }

    onGraphStateChange(GS);
    onEventDiffChange(ED);
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
