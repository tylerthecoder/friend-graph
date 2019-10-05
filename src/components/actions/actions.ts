import { IEvent, IEventDiff, IGraphState } from "../../types";
import { applyEvent } from "../events/functions";
import AddCon, { IAddConnectionAction } from "./action-types/add-con";
import AddNode, { IAddNodeAction } from "./action-types/add-node";
import EditCon, { IEditConnectionAction } from "./action-types/edit-con";
import EditNode, { IEditNodeAction } from "./action-types/edit-node";
import RmCon, { IRmConAction } from "./action-types/rm-con";
import RmNode, { IRmNodeAction } from "./action-types/rm-node";

export interface IInput {
  id: string;
  type: "text" | "number" | "id" | "img";
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

export interface IActionFunctions {
  formElements: IInput[];
  buttonText: string;
  properties: Array<{
    label: string;
    type: IActionProperty;
  }>;
  applyAction: (state: IGraphState, action: IAction) => IGraphState;
  undoAction: (prevState: IGraphState, action: IAction) => IAction;
  validate: (state: IGraphState, action: IAction) => IValidationResponse;
  removeActions?: (
    eventDiffs: IEventDiff[],
    action: IAction,
    index: number,
  ) => void;
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
  payload: IActionPayload;
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
  console.log("Applying", action);
  return getActionFunctions(action.type).applyAction(state, action);
}

export function undoAction(prevState: IGraphState, action: IAction): IAction {
  // this will have to be passed the previous graph state soon so data that is lost
  // can be recovered. (Like in rmNode)
  return getActionFunctions(action.type).undoAction(prevState, action);
}

export function validateAction(
  state: IGraphState,
  action: IAction,
): IValidationResponse {
  return getActionFunctions(action.type).validate(state, action);
}

export function cleanupEventDiffs(
  eventDiffs: IEventDiff[],
  index: number,
  state: IGraphState,
  action: IAction,
): IEventDiff[] {
  // copy the entire event diffs
  const newDiffs = [...eventDiffs].map((diff) => ({ ...diff }));

  const currentEvent = newDiffs[index];
  const prevEvent = newDiffs[index - 1];

  if (prevEvent && prevEvent.next) {
    prevEvent.next = {
      ...prevEvent.next,
      actions: [...prevEvent.next.actions, action],
    };
  }

  if (currentEvent && currentEvent.prev) {
    const prevState = applyEvent(state, currentEvent.prev);
    const undidAction = undoAction(prevState, action);

    currentEvent.prev = {
      ...currentEvent.prev,
      actions: [...currentEvent.prev.actions, undidAction],
    };
  }

  const actionFunctions = getActionFunctions(action.type);

  if (!actionFunctions.removeActions) {
    return newDiffs;
  }

  // the remove action function is not pure, it will change the newDiffs
  // but this is fine since we already copied it above
  actionFunctions.removeActions(newDiffs, action, index);

  return newDiffs;
}

export function getActionInputs(actionType: IActionType): IInput[] {
  return getActionFunctions(actionType).formElements;
}

export function getButtonText(actionType: IActionType): string {
  return getActionFunctions(actionType).buttonText;
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
