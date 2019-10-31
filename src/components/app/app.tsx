import React, { useState } from "react";
import { IGraphState } from "../../types";
import ActionPanel from "../actions/actions";
import Events, { initialEventDiffList } from "../events/events";
import { emptyGraphState, EventDiff } from "../events/functions";
import Graph from "../graph/graph";
import "./app.css";

function App() {
  const [graphState, setGraphState] = useState(emptyGraphState);
  const [eventDiff, setEventDiff] = useState(initialEventDiffList);

  function updateGraphState(state: IGraphState) {
    console.log("Graph State", state);
    setGraphState(state);
  }

  function updateEventDiff(diff: EventDiff) {
    console.log("Event Diff", diff);
    setEventDiff(diff);
  }

  return (
    <div className="app">
      <div className="left-panel">
        <Events
          graphState={graphState}
          eventDiff={eventDiff}
          onGraphStateChange={updateGraphState}
          onEventDiffChange={updateEventDiff}
        />
        <Graph graphState={graphState} />
      </div>
      <ActionPanel
        eventDiff={eventDiff}
        graphState={graphState}
        onNewGraphState={updateGraphState}
        onEventDiffChange={updateEventDiff}
      />
    </div>
  );
}

export default App;
