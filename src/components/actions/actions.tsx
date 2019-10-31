import React, { useState } from "react";
import { IGraphState } from "./../../types";
import { EventDiff } from "./../events/functions";
import ActionForm from "./action-form/action-form";
import ActionViewer from "./action-viewer/action-viewer";
import "./actions.css";
import {
  applyAction,
  cleanupEventDiffs,
  formToAction,
  IActionType,
} from "./functions";

interface Props {
  graphState: IGraphState;
  eventDiff: EventDiff;
  onNewGraphState: (state: IGraphState) => void;
  onEventDiffChange: (diff: EventDiff) => void;
}

export default function ActionPanel(props: Props) {
  const {
    eventDiff,
    onNewGraphState,
    onEventDiffChange: setEventDiff,
    graphState,
  } = props;
  const prevEvent = eventDiff && eventDiff.prev ? eventDiff.prev.event : null;
  const nextEvent = eventDiff && eventDiff.next ? eventDiff.next.event : null;

  const [openedFormIndex, setOpenedFormIndex] = useState(-1);

  function handleFormSubmit(
    actionType: IActionType,
    data: { [id: string]: any },
  ) {
    const payload = formToAction(actionType, data);

    const action = {
      // apply a unique id to the action
      id: `${Math.random()}:${Math.random()}`,
      type: actionType,
      payload,
    };

    const newGraphState = applyAction(graphState, action);
    // clean up the eventList if need be
    // for example, if I just deleted a node, make sure that all
    // later connections for that node are also deleted
    const newEventDiffs = cleanupEventDiffs(eventDiff, newGraphState, action);

    console.log("New Event Diffs", newEventDiffs);

    onNewGraphState(newGraphState);
    setEventDiff(newEventDiffs);
  }

  return (
    <div id="action-panel">
      {Object.values(IActionType).map((actionType, index) => (
        <ActionForm
          key={index}
          onSubmit={(data) => handleFormSubmit(actionType, data)}
          shown={index === openedFormIndex}
          onOpen={() => setOpenedFormIndex(index)}
          actionType={actionType}
          graphState={graphState}
        />
      ))}
      <br />
      <div>
        <p> Prev Events </p>
        {prevEvent &&
          prevEvent.actions.map((action) => (
            <ActionViewer key={action.id} action={action} />
          ))}
      </div>
      <br />
      <div>
        <p> Next Events </p>
        {nextEvent &&
          nextEvent.actions.map((action) => (
            <ActionViewer key={action.id} action={action} />
          ))}
      </div>
    </div>
  );
}
