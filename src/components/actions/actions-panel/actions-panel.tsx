import React from "react";
import { IEvent } from "../../../types";
import ActionForm from "../action-form/action-form";
import { IAction, IActionType } from "../actions";
import "./actions-panel.css";

interface Props {
  currentEvent: IEvent | null;
  onNewAction: (action: IAction) => void;
}

export default function ActionPanel(props: Props) {
  const { currentEvent, onNewAction } = props;

  return (
    <div id="action-panel">
      <ActionForm
        onAction={(action) => onNewAction(action)}
        actionType={IActionType.ADD_NODE}
        buttonText={"Add Node"}
      />
      <ActionForm
        onAction={(action) => onNewAction(action)}
        actionType={IActionType.ADD_CON}
        buttonText={"Add Connection"}
      />
      <ActionForm
        onAction={(action) => onNewAction(action)}
        actionType={IActionType.RM_NODE}
        buttonText={"Remove Node"}
      />
      <div>
        <p> Last Events </p>
        {currentEvent &&
          currentEvent.actions.map((action, index) => (
            <p key={index}>{JSON.stringify(action)}</p>
          ))}
      </div>
    </div>
  );
}
