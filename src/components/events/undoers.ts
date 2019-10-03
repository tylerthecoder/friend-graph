import {
  IAction,
  IActionType,
  IAddConnectionAction,
  IAddNodeAction,
  IEditConnectionAction,
} from "../../types";

const emptyAction = {
  type: IActionType.ADD_CON,
  payload: {
    id: "",
  },
};

function undoAddNode(action: IAction): IAction {
  const payload = action.payload as IAddNodeAction;
  return {
    type: IActionType.RM_NODE,
    payload: {
      id: payload.id,
    },
  };
}

function undoAddCon(action: IAction): IAction {
  const payload = action.payload as IAddConnectionAction;
  return {
    type: IActionType.RM_CON,
    payload: {
      startId: payload.startId,
      endId: payload.endId,
    },
  };
}

function undoEditCon(action: IAction): IAction {
  const payload = action.payload as IEditConnectionAction;
  return {
    type: IActionType.EDIT_CON,
    payload: {
      ...payload,
      dw: payload.dw * -1,
    },
  };
}

export default function undoAction(action: IAction): IAction {
  switch (action.type) {
    case IActionType.ADD_NODE:
      return undoAddNode(action);
    case IActionType.ADD_CON:
      return undoAddCon(action);
    case IActionType.EDIT_CON:
      return undoEditCon(action);
    // It should never reach here. All cases should be taken care off
    default:
      return emptyAction;
  }
}
