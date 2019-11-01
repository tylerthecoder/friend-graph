import { IGraphState } from "../../../types";
import { EventDiff } from "../../events/functions";
import { IAction, IFormData, IInput, IValidationResponse } from "../functions";
import AddCon, { IAddConnectionAction } from "./add-con/add-con";
import AddNode, { IAddNodeAction } from "./add-node/add-node";
import EditCon, { IEditConnectionAction } from "./edit-con/edit-con";
import EditNode, { IEditNodeAction } from "./edit-node/edit-node";
import RmCon, { IRmConAction } from "./rm-con/rm-con";
import RmNode, { IRmNodeAction } from "./rm-node/rm-node";

export enum IActionProperty {
  IMG = "IMG",
  ID = "ID",
  NUM = "NUM",
  CONNECTION_TYPE = "CONNECTION_TYPE",
}

export enum IActionType {
  ADD_NODE = "ADD_NODE",
  RM_NODE = "RM_NODE",
  EDIT_NODE = "EDIT_NODE",
  ADD_CON = "ADD_CON",
  EDIT_CON = "EDIT_CON",
  RM_CON = "RM_CON",
}

export interface IActionPayloads {
  addNodePayload?: IAddNodeAction;
  addConPayload?: IAddConnectionAction;
  rmNodePayload?: IRmNodeAction;
  rmConPayload?: IRmConAction;
  editNodePayload?: IEditNodeAction;
  editConPayload?: IEditConnectionAction;
}

export type IActionPayload =
  | IAddNodeAction
  | IRmNodeAction
  | IEditNodeAction
  | IAddConnectionAction
  | IEditConnectionAction
  | IRmConAction;

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
    payload: IActionPayload,
    state: IGraphState,
    eventDiff: EventDiff,
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

export function getActionFunctions(actionType: IActionType) {
  const actionFunctions = actionTypesToActions.get(actionType);

  // all action types should be defined
  if (!actionFunctions) {
    throw new Error("Action type does not exist");
  }
  return actionFunctions;
}
