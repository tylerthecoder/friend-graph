import { IConnectionType, IGraphState } from "../../../../types";
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

export interface IAddConnectionAction {
  startId: string;
  endId: string;
  weight: number;
  type: IConnectionType;
}

export default class AddCon implements IActionFunctions {
  public properties = [
    { label: "startId", type: IActionProperty.ID },
    { label: "endId", type: IActionProperty.ID },
    { label: "weight", type: IActionProperty.NUM },
    { label: "type", type: IActionProperty.CONNECTION_TYPE },
  ];

  public formElements: IInput[] = [
    { type: "id", id: "startId" },
    { type: "id", id: "endId" },
    { type: "number", id: "weight" },
    { type: "number", id: "type" },
  ];

  public buttonText = "Add Connection";

  public formToAction(data: IFormData) {
    return {
      startId: data.startId,
      endId: data.endId,
      weight: data.weight,
      type: data.type,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = action.addConPayload!;
    return {
      ...state,
      connections: {
        ...state.connections,
        [`${payload.startId}:${payload.endId}`]: payload,
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = action.addConPayload!;
    return {
      ...action,
      type: IActionType.RM_CON,
      rmConPayload: {
        startId: payload.startId,
        endId: payload.endId,
      },
    };
  }

  public validate(
    data: IActionPayload,
    _state: IGraphState,
    _diff: EventDiff,
  ): IValidationResponse {
    const payload = this.payloadCast(data);
    if (payload.startId === payload.endId) {
      return {
        isValid: false,
        message: "StartId can't equal EndId",
      };
    } else {
      return {
        isValid: true,
      };
    }
  }

  public removeActions(eventDiff: EventDiff, action: IAction): void {
    // look through the actions, if we find another add node with the same id
    // then change it to either be a edit_node (if the node is in a different place) or just remove it

    let keepGoing = true;
    let runner: EventDiff | null = eventDiff;
    while (keepGoing && runner) {
      if (runner.next) {
        const newActions = runner.next.event.actions.map(
          (a): IAction => {
            const aPayload = a.addConPayload!;
            const actionPayload = action.addConPayload!;
            if (
              a.type === IActionType.ADD_CON &&
              aPayload.startId === actionPayload.startId &&
              aPayload.endId === actionPayload.endId
            ) {
              keepGoing = false;
              return {
                id: a.id,
                type: IActionType.EDIT_CON,
                editConPayload: {
                  startId: aPayload.startId,
                  endId: aPayload.endId,
                  dw: actionPayload.weight - aPayload.weight,
                },
              };
            }
            return { ...action };
          },
        );
        if (!keepGoing) {
          runner.next.event.actions = newActions;
        }
      }

      runner = runner.next ? runner.next.diff : null;
    }
  }

  private payloadCast(payload: any) {
    return payload as IAddConnectionAction;
  }
}
