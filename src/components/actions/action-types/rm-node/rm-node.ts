import { IEvent, IGraphState } from "../../../../types";
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
    const newState = {
      ...state,
      nodes: { ...state.nodes },
    };
    delete newState.nodes[action.rmNodePayload!.id];
    return newState;
  }

  public undoAction(prevState: IGraphState, action: IAction): IAction {
    return {
      ...action,
      type: IActionType.ADD_NODE,
      addNodePayload: {
        ...prevState.nodes[action.rmNodePayload!.id],
        id: action.rmNodePayload!.id,
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

  // NOTE: This function is not pure. It will alter the eventDiffs that is passed to it.
  public removeActions(eventDiff: EventDiff, action: IAction): void {
    const payload = action.rmNodePayload!;

    // if possible get the node right before
    let runner: EventDiff | null = eventDiff.prev
      ? eventDiff.prev.diff
      : eventDiff;

    // we only want to remove connections, not everything with an id

    const removeConnectionsWithID = (event: IEvent, id: string) => {
      const invalidEventTypes = ["RM_CON", "ADD_CON"];
      return {
        ...event,
        actions: event.actions
          .filter(
            (eve) =>
              !(
                invalidEventTypes.includes(eve.type) &&
                (eve.addConPayload!.startId === id ||
                  eve.addConPayload!.endId === id)
              ),
          )
          .slice(0),
      };
    };

    while (runner) {
      if (runner.next) {
        runner.next.event = removeConnectionsWithID(
          runner.next.event,
          payload.id,
        );
      }
      // if we are checking the diff right before the current, do not modify the prev event.
      // Since that would be deleting something that can be left
      if (runner.prev && (eventDiff.prev && runner !== eventDiff.prev.diff)) {
        runner.prev.event = removeConnectionsWithID(
          runner.prev.event,
          payload.id,
        );
      }
      runner = runner.next ? runner.next.diff : null;
    }
  }
}
