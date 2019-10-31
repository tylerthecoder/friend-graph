import { IEvent, IGraphState } from "../../types";
import { applyEvent, EventDiff } from "../events/functions";
import {
  getActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
} from "./action-types/action-types";

export interface IInput {
  id: string;
  type: "text" | "number" | "id" | "img" | "pos";
}

export interface IFormData {
  [id: string]: any;
}

export interface IValidationResponse {
  isValid: boolean;
  message?: string;
}

export interface IAction {
  type: IActionType;
  id: string;
  payload: IActionPayload;
}

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  // console.log("Applying", action);
  return getActionFunctions(action.type).applyAction(state, action);
}

export function undoAction(prevState: IGraphState, action: IAction): IAction {
  // this will have to be passed the previous graph state soon so data that is lost
  // can be recovered. (Like in rmNode)
  return getActionFunctions(action.type).undoAction(prevState, action);
}

export function validateAction(
  state: IGraphState,
  type: IActionType,
  payload: IActionPayload,
  eventDiff: EventDiff,
): IValidationResponse {
  return getActionFunctions(type).validate(payload, state, eventDiff);
}

export function cleanupEventDiffs(
  eventDiffs: EventDiff,
  state: IGraphState,
  action: IAction,
): EventDiff {
  const prevEvent = eventDiffs.prev ? eventDiffs.prev.diff : null;
  const currentEvent = eventDiffs;

  if (prevEvent && prevEvent.next) {
    prevEvent.next = {
      ...prevEvent.next,
      event: {
        ...prevEvent.next.event,
        actions: [...prevEvent.next.event.actions, action],
      },
    };
  }

  if (currentEvent && currentEvent.prev) {
    const prevState = applyEvent(state, currentEvent.prev.event);
    const undidAction = undoAction(prevState, action);

    currentEvent.prev = {
      ...currentEvent.prev,
      event: {
        ...currentEvent.prev.event,
        actions: [...currentEvent.prev.event.actions, undidAction],
      },
    };
  }

  const actionFunctions = getActionFunctions(action.type);

  if (!actionFunctions.removeActions) {
    return eventDiffs;
  }

  // the remove action function is not pure, it will change the newDiffs
  // but this is fine since we already copied it above
  actionFunctions.removeActions(eventDiffs, action);

  return eventDiffs;
}

export function getActionInputs(actionType: IActionType): IInput[] {
  return getActionFunctions(actionType).formElements;
}

export function getButtonText(actionType: IActionType): string {
  return getActionFunctions(actionType).buttonText;
}

export function formToAction(
  actionType: IActionType,
  data: { [id: string]: any },
) {
  return getActionFunctions(actionType).formToAction!(data);
}

export function applyActionAndUpdate(
  action: IAction,
  GS: IGraphState,
  ED: EventDiff,
): [IGraphState, EventDiff] {
  const tGS = applyAction(GS, action);
  // clean up the eventList if need be
  // for example, if I just deleted a node, make sure that all
  // later connections for that node are also deleted
  const tED = cleanupEventDiffs(ED, GS, action);
  return [tGS, tED];
}

// Helper Functions
export function removeActionsWithId(event: IEvent, id: string): IEvent {
  return {
    ...event,
    actions: event.actions
      .filter((action) =>
        getActionFunctions(action.type)
          .properties // get all of the action properties of type id
          // then map to the id property (might be of type keyof T soon)
          .filter((prop) => prop.type === IActionProperty.ID)
          .map((input) => input.label)
          // make sure all of the id like properties are not of the id we are looking for
          // get rid of this "as any" once I figure out how to correctly type the formElement Ids
          .every((payloadKey) => (action.payload as any)[payloadKey] !== id),
      )
      // copy the actions
      .map((action) => ({ ...action })),
  };
}
