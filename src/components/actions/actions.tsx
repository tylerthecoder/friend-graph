import React, { useState } from "react";
import { IGraphState } from "./../../types";
import { EventDiff } from "./../events/functions";
import ActionForm from "./action-form/action-form";
import { IActionType } from "./action-types/action-types";
import ActionViewer from "./action-viewer/action-viewer";
import "./actions.css";
import { applyActionAndUpdate, formToAction } from "./functions";

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

    const [GS, ED] = applyActionAndUpdate(action, graphState, eventDiff);

    onNewGraphState(GS);
    setEventDiff(ED);
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
