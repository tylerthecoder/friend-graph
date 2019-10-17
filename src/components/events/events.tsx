import React, { useState } from "react";
import eventData from "../../data/events.json";
import { IEvent, IEventDiff, IGraphState } from "../../types";
import "./events.css";
import {
  applyEvent,
  calculateEventDiffs,
  makeEventDiffList,
} from "./functions";

const events = eventData as IEvent[];
export const initialEventDiffs = calculateEventDiffs(events);

function toDateInputValue(d: number) {
  const date = new Date(d);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toJSON().slice(0, 10);
}

interface Props {
  graphState: IGraphState;
  currentEventIndex: number;
  eventDiffs: IEventDiff[];
  onGraphStateChange: (state: IGraphState) => void;
  onEventDiffChange: (diffs: IEventDiff[]) => void;
  onIndexChange: (index: number) => void;
  onDateChange: (date: number) => void;
}

const d = makeEventDiffList(events);

export default function Events(props: Props) {
  const {
    graphState,
    eventDiffs,
    currentEventIndex,
    onGraphStateChange,
    onEventDiffChange,
    onIndexChange,
  } = props;

  const [displayedEventIndex, setDisplayedEventIndex] = useState(
    currentEventIndex,
  );
  const [updateState, setUpdateState] = useState(false);

  const diffIndex = currentEventIndex - displayedEventIndex;

  let newGraphState = graphState;

  // if we are not currently displaying the correct event
  // then re-calculate the state
  if (diffIndex !== 0 && updateState) {
    // if the current event is a ghost
    // then remove it. We didn't do anything to it

    if (diffIndex > 0) {
      // go forward with .next
      // make this a .reduce() somehow later
      for (let i = displayedEventIndex; i < currentEventIndex; i++) {
        const event = eventDiffs[i].next;
        if (!event) {
          continue;
        }
        newGraphState = applyEvent(newGraphState, event);
      }
    } else {
      // go back with .prev
      for (let i = displayedEventIndex; i > currentEventIndex; i--) {
        const event = eventDiffs[i].prev;
        if (!event) {
          continue;
        }
        newGraphState = applyEvent(newGraphState, event);
      }
    }

    if (
      eventDiffs[displayedEventIndex].prev &&
      eventDiffs[displayedEventIndex - 1].next!.actions.length === 0
    ) {
      // delete the ghost
      const diffs = deleteGhostNode(displayedEventIndex, graphState.time);
      onEventDiffChange(diffs);
      if (currentEventIndex > displayedEventIndex) {
        onIndexChange(currentEventIndex - 1);
        setDisplayedEventIndex(currentEventIndex - 1);
      } else {
        onIndexChange(currentEventIndex);
        setDisplayedEventIndex(currentEventIndex);
      }
    } else {
      setDisplayedEventIndex(currentEventIndex);
    }

    onGraphStateChange(newGraphState);
    setUpdateState(false);
  }

  function goToIndex(index: number, override = false) {
    if (eventDiffs[index] || override) {
      setUpdateState(true);
      onIndexChange(index);
    }
  }

  function insertGhostNode(
    index: number,
    timeAtIndex: number,
    ghostTime: number,
  ) {
    const currentEventDiff = eventDiffs[index];
    const nextEventDiff = eventDiffs[index + 1];

    const ghostEventDiff: IEventDiff = { next: null, prev: null };
    const nextNodeTime =
      timeAtIndex + (currentEventDiff.next ? currentEventDiff.next.dTime : 0);

    if (nextEventDiff) {
      const nextActions = currentEventDiff.next
        ? currentEventDiff.next.actions.map((action) => ({ ...action }))
        : [];
      ghostEventDiff.next = {
        actions: nextActions,
        dTime: nextNodeTime - ghostTime,
      };

      const prevActions = nextEventDiff.prev
        ? nextEventDiff.prev.actions.map((action) => ({ ...action }))
        : [];
      nextEventDiff.prev = {
        actions: prevActions,
        dTime: ghostTime - nextNodeTime,
      };
    }

    // if nextEventDiff is defined then nextEventDiff.prev has to be defined
    // make sure we don't assign and then read again
    if (currentEventDiff) {
      ghostEventDiff.prev = {
        actions: [],
        dTime: timeAtIndex - ghostTime,
      };
      currentEventDiff.next = {
        actions: [],
        dTime: ghostTime - timeAtIndex,
      };
    }

    const newEventDiffs = [...eventDiffs];
    newEventDiffs.splice(index + 1, 0, ghostEventDiff);
    onEventDiffChange(newEventDiffs);

    // we inserted a node before the current state
    // so the index goes up by one
    if (index < currentEventIndex) {
      setDisplayedEventIndex(displayedEventIndex + 1);
    }

    goToIndex(index + 1, true);
  }

  function deleteGhostNode(index: number, timeAtIndex: number) {
    const prevEventDiff = eventDiffs[index - 1];
    const ghostEventDiff = eventDiffs[index];
    const nextEventDiff = eventDiffs[index + 1];
    const nextTime =
      timeAtIndex + (ghostEventDiff.next ? ghostEventDiff.next.dTime : 0);
    const prevTime =
      timeAtIndex + (ghostEventDiff.prev ? ghostEventDiff.prev.dTime : 0);

    if (prevEventDiff && ghostEventDiff.next) {
      prevEventDiff.next = {
        actions: ghostEventDiff.next.actions.map((a) => ({ ...a })),
        dTime: nextTime - prevTime,
      };
    } else {
      prevEventDiff.next = null;
    }

    if (nextEventDiff) {
      nextEventDiff.prev = {
        actions: nextEventDiff.prev
          ? nextEventDiff.prev.actions.map((a) => ({ ...a }))
          : [],
        dTime: prevTime - nextTime,
      };
    }

    const newEventDiffs = [...eventDiffs];
    newEventDiffs.splice(index, 1);
    return newEventDiffs;
  }

  function handleNewTime(event: React.ChangeEvent<HTMLInputElement>) {
    const [year, month, day] = event.target.value.split("-");
    const dateString = `${month}/${day}/${year}`;
    const inputtedTime = new Date(dateString).getTime();
    const inputDateString = new Date(dateString).toDateString();

    // I don't really like how I did this because I don't every want to itterate through
    // all of the event diffs. That kind of defeats the purpose of the diff design
    // make just move up and down the diffs until the closest date is found

    // now run through all of the events and find the one closest to this date.
    // if it is not the same date, then create a new event?
    // could binary search since the list is sorted? Maybe later. Might be hard since we only store dTime
    let currentDate = 0;
    let currentDateIndex = 0;
    let closestIndex = -1;
    let closestTime = 0;
    const isNewDate = eventDiffs.every((eventDiff, index) => {
      if (eventDiff.next) {
        currentDate += eventDiff.next.dTime;
        currentDateIndex = index;
        if (currentDate < inputtedTime) {
          closestIndex = index;
          closestTime = currentDate;
        }
      }
      return new Date(currentDate).toDateString() !== inputDateString;
    });

    if (isNewDate) {
      insertGhostNode(closestIndex + 1, closestTime, inputtedTime);
    } else {
      goToIndex(currentDateIndex + 1);
    }
  }

  return (
    <div id="events">
      <button onClick={() => goToIndex(currentEventIndex - 1)}>Previous</button>
      <button onClick={() => goToIndex(currentEventIndex + 1)}> Next </button>
      {new Date(graphState.time).toDateString()}({graphState.time})
      <input
        type="date"
        value={toDateInputValue(graphState.time)}
        onChange={handleNewTime}
      />
    </div>
  );
}
