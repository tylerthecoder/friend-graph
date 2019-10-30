import { IEvent, IGraphState } from "../../types";
import { applyEvent, EventDiff } from "../events/functions";
import AddCon, { IAddConnectionAction } from "./action-types/add-con";
import AddNode, { IAddNodeAction } from "./action-types/add-node";
import EditCon, { IEditConnectionAction } from "./action-types/edit-con";
import EditNode, { IEditNodeAction } from "./action-types/edit-node";
import RmCon, { IRmConAction } from "./action-types/rm-con";
import RmNode, { IRmNodeAction } from "./action-types/rm-node";

export interface IInput {
  id: string;
  type: "text" | "number" | "id" | "img" | "pos";
}

export interface IFormData {
  [id: string]: any;
}

export enum IActionType {
  ADD_NODE = "ADD_NODE",
  RM_NODE = "RM_NODE",
  EDIT_NODE = "EDIT_NODE",
  ADD_CON = "ADD_CON",
  EDIT_CON = "EDIT_CON",
  RM_CON = "RM_CON",
}

export enum IActionProperty {
  IMG = "IMG",
  ID = "ID",
  NUM = "NUM",
  CONNECTION_TYPE = "CONNECTION_TYPE",
}

export interface IValidationResponse {
  isValid: boolean;
  message?: string;
}

export type IActionPayload =
  | IAddNodeAction
  | IRmNodeAction
  | IEditNodeAction
  | IAddConnectionAction
  | IEditConnectionAction
  | IRmConAction;

export interface IAction {
  type: IActionType;
  id: string;
  payload: IActionPayload;
}

export interface IActionFunctions {
  formElements: IInput[];
  buttonText: string;
  properties: Array<{
    label: string;
    type: IActionProperty;
  }>;
  formToAction: (data: IFormData) => IActionPayload;
  applyAction: (state: IGraphState, action: IAction) => IGraphState;
  undoAction: (prevState: IGraphState, action: IAction) => IAction;
  validate: (
    state: IGraphState,
    payload: IActionPayload,
  ) => IValidationResponse;
  removeActions?: (eventDiffs: EventDiff, action: IAction) => void;
}

const actionTypesToActions: Map<IActionType, IActionFunctions> = new Map();
actionTypesToActions.set(IActionType.ADD_NODE, new AddNode());
actionTypesToActions.set(IActionType.EDIT_NODE, new EditNode());
actionTypesToActions.set(IActionType.RM_NODE, new RmNode());
actionTypesToActions.set(IActionType.ADD_CON, new AddCon());
actionTypesToActions.set(IActionType.EDIT_CON, new EditCon());
actionTypesToActions.set(IActionType.RM_CON, new RmCon());

function getActionFunctions(actionType: IActionType) {
  const actionFunctions = actionTypesToActions.get(actionType);

  // all action types should be defined
  if (!actionFunctions) {
    throw new Error("Action type does not exist");
  }
  return actionFunctions;
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
): IValidationResponse {
  return getActionFunctions(type).validate(state, payload);
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
