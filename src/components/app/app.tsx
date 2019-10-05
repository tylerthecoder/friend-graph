import React, { useState } from "react";
import { IEventDiff, IGraphState } from "../../types";
import ActionPanel from "../actions/actions-panel/actions-panel";
import Events, { initialEventDiffs } from "../events/events";
import { emptyGraphState } from "../events/functions";
import Graph from "../graph/graph";
import "./app.css";

function App() {
  const [graphState, setGraphState] = useState(emptyGraphState);
  const [eventDiffs, setEventDiffs] = useState(initialEventDiffs);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  function updateGraphState(state: IGraphState) {
    console.log("Graph State", state);
    setGraphState(state);
  }

  function updateEventDiffs(diffs: IEventDiff[]) {
    console.log("Event Diffs", diffs);
    setEventDiffs(diffs);
  }

  function updateCurrentEventIndex(index: number) {
    console.log("Event Index", index);
    setCurrentEventIndex(index);
  }

  return (
    <div className="App">
      <Events
        graphState={graphState}
        currentEventIndex={currentEventIndex}
        eventDiffs={eventDiffs}
        onIndexChange={updateCurrentEventIndex}
        onGraphStateChange={updateGraphState}
      />
      <Graph graphState={graphState} />
      <ActionPanel
        eventDiffs={eventDiffs}
        currentEventIndex={currentEventIndex}
        graphState={graphState}
        onNewGraphState={updateGraphState}
        onNewEventDiffList={updateEventDiffs}
      />
    </div>
  );
}

export default App;