import { IEvent, IEventDiff, IGraphState } from "../../../types";
import {
  IAction,
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
  IFormData,
  IInput,
  IValidationResponse,
  removeActionsWithId,
} from "../actions";

export interface IRmNodeAction {
  id: string;
}

export default class RmNode implements IActionFunctions {
  public properties = [{ label: "id", type: IActionProperty.ID }];

  public formElements: IInput[] = [{ type: "id", id: "id" }];

  public buttonText = "Remove Node";

  public formToAction(data: IFormData) {
    return {
      id: data.id,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.payload as IRmNodeAction;
    const newState = {
      ...state,
      nodes: { ...state.nodes },
    };
    delete newState.nodes[payload.id];
    return newState;
  }

  // this is incorrect, maybe pass in the previous graphState and do the {prev, next} thing again
  public undoAction(prevState: IGraphState, action: IAction): IAction {
    const payload = action.payload as IRmNodeAction;
    const node = prevState.nodes[payload.id];
    return {
      ...action,
      type: IActionType.ADD_NODE,
      payload: {
        ...node,
        id: payload.id,
      },
    };
  }

  public validate(
    _state: IGraphState,
    _action: IActionPayload,
  ): IValidationResponse {
    return {
      isValid: true,
    };
  }

  // NOTE: This function is not pure. It will alter the eventDiffs that is passed to it.
  public removeActions(
    eventDiffs: IEventDiff[],
    action: IAction,
    index: number,
  ): void {
    const payload = this.getPayload(action);

    console.log("Args", eventDiffs, action, index);

    // remove all elements
    for (let i = index - 1; i < eventDiffs.length; i++) {
      // don't remove from events that are before the delete

      if (eventDiffs[i].prev && i !== index - 1) {
        eventDiffs[i].prev = removeActionsWithId(
          eventDiffs[i].prev as IEvent,
          payload.id,
        );
      }
      if (eventDiffs[i].next) {
        eventDiffs[i].next = removeActionsWithId(
          eventDiffs[i].next as IEvent,
          payload.id,
        );
      }
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IRmNodeAction;
  }
}
