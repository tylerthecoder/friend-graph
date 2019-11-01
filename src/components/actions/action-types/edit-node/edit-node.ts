import { IGraphState } from "../../../../types";
import { EventDiff } from "../../../events/functions";
import {
  IAction,
  IFormData,
  IInput,
  IValidationResponse,
} from "../../functions";
import {
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
} from "../action-types";

export interface IEditNodeAction {
  id: string;
  dx: number;
  dy: number;
}

export default class EditNode implements IActionFunctions {
  public properties = [
    { label: "id", type: IActionProperty.ID },
    { label: "dx", type: IActionProperty.NUM },
    { label: "dy", type: IActionProperty.NUM },
  ];

  public formElements: IInput[] = [
    { type: "number", id: "dx" },
    { type: "number", id: "dy" },
    { type: "id", id: "id" },
  ];

  public buttonText = "Edit Node";

  public formToAction(data: IFormData) {
    return {
      dx: data.dx,
      dy: data.dy,
      id: data.id,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.editNodePayload!;
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [payload.id]: {
          ...state.nodes[payload.id],
          x: state.nodes[payload.id].x + payload.dx,
          y: state.nodes[payload.id].y + payload.dy,
        },
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = action.editNodePayload!;
    return {
      ...action,
      type: IActionType.EDIT_NODE,
      editNodePayload: {
        ...payload,
        dx: payload.dx * -1,
        dy: payload.dy * -1,
      },
    };
  }

  public validate(
    _data: IActionPayload,
    _state: IGraphState,
    _diff: EventDiff,
  ): IValidationResponse {
    return {
      isValid: true,
    };
  }

  public removeActions(eventDiffs: EventDiff, action: IAction): void {
    // const payload = this.getPayload(action);
    // Bad things that can happen
    // 1. You try to edit the node after deleting it
    // Not too sure how this is bad. Should have documented better
    // function isSameAction(a: IAction): boolean {
    //   return (
    //     a.type === IActionType.EDIT_NODE &&
    //     (a.payload as IEditNodeAction).id === payload.id
    //   );
    // }
    // if (eventDiffs[index].prev) {
    //   // Check for an RM_NODE with id of action.i
    //   const isRemoved = eventDiffs[index].prev!.actions.some(
    //     (action) =>
    //       action.type === IActionType.RM_NODE &&
    //       (action.payload as IRmNodeAction).id,
    //   );
    //   if (isRemoved) {
    //     // remove the edit connection from the prev and change the add_con action on the previous event diff
    //     eventDiffs[index].prev!.actions = eventDiffs[
    //       index
    //     ].prev!.actions.filter((a) => !isSameAction(a));
    //     // update the add connection
    //     eventDiffs[index - 1]
    //       .next!.actions.filter(
    //         (a) =>
    //           a.type === IActionType.ADD_NODE &&
    //           (a.payload as IAddNodeAction).id === payload.id,
    //       )
    //       .forEach((addAction) => {
    //         (addAction.payload as IAddNodeAction).x += payload.dx;
    //         (addAction.payload as IAddNodeAction).y += payload.dy;
    //       });
    //     // remove the edit connection
    //     eventDiffs[index - 1].next!.actions = eventDiffs[
    //       index - 1
    //     ].next!.actions.filter((a) => !isSameAction(a));
    //   }
    // }
  }
}
