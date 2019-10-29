import React, { useState } from "react";
import { IEventDiff, IGraphState } from "../../types";
import ActionPanel from "../actions/actions-panel/actions-panel";
import Events, {
  initialEventDiffList,
  initialEventDiffs,
} from "../events/events";
import { emptyGraphState, EventDiff } from "../events/functions";
import Graph from "../graph/graph";
import "./app.css";

function App() {
  const [graphState, setGraphState] = useState(emptyGraphState);
  const [eventDiffs, setEventDiffs] = useState(initialEventDiffs);
  const [eventDiff, setEventDiff] = useState(initialEventDiffList);

  function updateGraphState(state: IGraphState) {
    console.log("Graph State", state);
    setGraphState(state);
  }

  function updateEventDiffs(diffs: IEventDiff[]) {
    console.log("Event Diffs", diffs);
    setEventDiffs(diffs);
  }

  function updateEventDiff(diff: EventDiff) {
    console.log("Event Diff", diff);
    setEventDiff(diff);
  }

  function updateDate() {
    console.log("Change Date");
  }

  return (
    <div className="app">
      <div className="left-panel">
        <Events
          graphState={graphState}
          eventDiffs={eventDiffs}
          eventDiff={eventDiff}
          onGraphStateChange={updateGraphState}
          onEventDiffChange={updateEventDiffs}
          onEventDiffChange2={updateEventDiff}
          onDateChange={updateDate}
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
