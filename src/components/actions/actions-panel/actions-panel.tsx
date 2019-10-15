import React, { useState } from "react";
import { IEventDiff, IGraphState } from "../../../types";
import ActionForm from "../action-form/action-form";
import ActionViewer from "../action-viewer/action-viewer";
import {
  applyAction,
  cleanupEventDiffs,
  formToAction,
  IActionType,
} from "../actions";
import "./actions-panel.css";

interface Props {
  graphState: IGraphState;
  eventDiffs: IEventDiff[];
  currentEventIndex: number;
  onNewGraphState: (state: IGraphState) => void;
  onNewEventDiffList: (state: IEventDiff[]) => void;
}

export default function ActionPanel(props: Props) {
  const {
    eventDiffs,
    currentEventIndex,
    onNewGraphState,
    onNewEventDiffList,
    graphState,
  } = props;
  const prevEvent =
    currentEventIndex === 0 ? null : eventDiffs[currentEventIndex - 1].next;
  const nextEvent =
    currentEventIndex === eventDiffs.length - 1
      ? null
      : eventDiffs[currentEventIndex].next;

  const [openedFormIndex, setOpenedFormIndex] = useState(-1);

  function handleFormSubmit(
    actionType: IActionType,
    data: { [id: string]: any },
  ) {
    const payload = formToAction(actionType, data);
    console.log(payload);

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
    const newEventDiffs = cleanupEventDiffs(
      eventDiffs,
      currentEventIndex,
      newGraphState,
      action,
    );

    console.log("New Event Diffs", newEventDiffs);

    onNewGraphState(newGraphState);
    onNewEventDiffList(newEventDiffs);
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
