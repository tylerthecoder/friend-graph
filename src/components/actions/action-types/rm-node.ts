import { IGraphState } from "../../../types";
import { EventDiff } from "../../events/functions";
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
  public removeActions(eventDiff: EventDiff, action: IAction): void {
    const payload = this.getPayload(action);

    console.log("Removing Actions");
    // if possible get the node right before
    let runner: EventDiff | null = eventDiff.prev
      ? eventDiff.prev.diff
      : eventDiff;

    while (runner) {
      if (runner.next) {
        runner.next.event = removeActionsWithId(runner.next.event, payload.id);
      }
      // if we are checking the diff right before the current, do not modify the prev event.
      // Since that would be deleting something that can be left
      if (runner.prev && (eventDiff.prev && runner !== eventDiff.prev.diff)) {
        runner.prev.event = removeActionsWithId(runner.prev.event, payload.id);
      }
      runner = runner.next ? runner.next.diff : null;
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IRmNodeAction;
  }
}
