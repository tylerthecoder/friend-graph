import { IGraphState } from "../../types";
import { emptyGraphState } from "../events/events";
import * as AddCon from "./action-types/add-con";
import * as AddNode from "./action-types/add-node";
import * as EditCon from "./action-types/edit-con";
import * as EditNode from "./action-types/edit-node";
import * as RmCon from "./action-types/rm-con";
import * as RmNode from "./action-types/rm-node";

export interface IInput {
  id: string;
  type: "text" | "number" | "id";
}

export enum IActionType {
  ADD_NODE = "ADD_NODE",
  RM_NODE = "RM_NODE",
  EDIT_NODE = "EDIT_NODE",
  ADD_CON = "ADD_CON",
  EDIT_CON = "EDIT_CON",
  RM_CON = "RM_CON",
}

const emptyAction: IAction = {
  type: IActionType.ADD_CON,
  payload: {
    id: "",
  },
};

interface IActionFunctions {
  formElements: IInput[];
  applyAction: (state: IGraphState, action: IAction) => IGraphState;
  undoAction: (prevState: IGraphState, action: IAction) => IAction;
}

type IActionPayload =
  | AddNode.IAddNodeAction
  | RmNode.IRmNodeAction
  | EditNode.IEditNodeAction
  | AddCon.IAddConnectionAction
  | EditCon.IEditConnectionAction
  | RmCon.IRmConAction;

export interface IAction {
  type: IActionType;
  payload: IActionPayload;
}

const actionTypesToActions: Map<IActionType, IActionFunctions> = new Map();
actionTypesToActions.set(IActionType.ADD_NODE, AddNode);
actionTypesToActions.set(IActionType.EDIT_NODE, EditNode);
actionTypesToActions.set(IActionType.RM_NODE, RmNode);
actionTypesToActions.set(IActionType.ADD_CON, AddCon);
actionTypesToActions.set(IActionType.EDIT_CON, EditCon);
actionTypesToActions.set(IActionType.RM_CON, RmCon);

export function applyAction(state: IGraphState, action: IAction): IGraphState {
  const actionFunctions = actionTypesToActions.get(action.type);
  if (!actionFunctions) {
    return emptyGraphState;
  }
  console.log("Applying", action);

  return actionFunctions.applyAction(state, action);
}

export function undoAction(prevState: IGraphState, action: IAction): IAction {
  const actionFunctions = actionTypesToActions.get(action.type);
  if (!actionFunctions) {
    return emptyAction;
  }

  // this will have to be passed the previous graph state soon so data that is lost
  // can be recovered. (Like in rmNode)
  return actionFunctions.undoAction(prevState, action);
}

export function getActionInputs(actionType: IActionType): IInput[] {
  const actionFunctions = actionTypesToActions.get(actionType);
  if (!actionFunctions) {
    return [];
  }
  return actionFunctions.formElements;
}
