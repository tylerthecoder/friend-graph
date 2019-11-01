import { IGraphState } from "../../../../types";
import { EventDiff } from "../../../events/functions";
import { IAction, IInput, IValidationResponse } from "../../functions";
import {
  IActionFunctions,
  IActionPayload,
  IActionProperty,
  IActionType,
} from "../action-types";

export interface IAddNodeAction {
  id: string;
  img: string;
  x: number;
  y: number;
}

export default class AddNode implements IActionFunctions {
  public properties = [
    { label: "id", type: IActionProperty.ID },
    { label: "img", type: IActionProperty.IMG },
    { label: "x", type: IActionProperty.NUM },
    { label: "y", type: IActionProperty.NUM },
  ];

  public formElements: IInput[] = [
    { type: "pos", id: "pos" },
    { type: "img", id: "img" },
    { type: "text", id: "id" },
  ];

  public buttonText = "Add Node";

  public formToAction(data: { [id: string]: any }): IAddNodeAction {
    return {
      id: data.id,
      img: data.img,
      x: data.pos.x,
      y: data.pos.y,
    };
  }

  public applyAction(state: IGraphState, action: IAction): IGraphState {
    const payload = this.getPayload(action);
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [payload.id]: payload,
      },
    };
  }

  public undoAction(_prevState: IGraphState, action: IAction): IAction {
    const payload = this.getPayload(action);
    return {
      ...action,
      type: IActionType.RM_NODE,
      payload: {
        id: payload.id,
      },
    };
  }

  public validate(
    data: IActionPayload,
    state: IGraphState,
    diff: EventDiff,
  ): IValidationResponse {
    const payload = data as IAddNodeAction;
    const idInGS = Object.values(state.nodes).some(
      (node) => node.id === payload.id,
    );

    if (idInGS) {
      return {
        isValid: false,
        message: "Id already exists",
      };
    }

    return {
      isValid: true,
    };
  }

  public removeActions(eventDiff: EventDiff, action: IAction): void {
    // look through the actions, if we find another add node with the same id
    // then change it to either be a edit_node (if the node is in a different place) or just remove it

    let keepGoing = true;
    let runner: EventDiff | null = eventDiff;
    while (keepGoing && runner) {
      if (runner.next) {
        const newActions = runner.next.event.actions.map((a) => {
          const aPayload = a.payload as IAddNodeAction;
          const actionPayload = action.payload as IAddNodeAction;
          if (
            action.type === IActionType.ADD_NODE &&
            aPayload.id === aPayload.id
          ) {
            keepGoing = false;
            return {
              ...a,
              type: IActionType.EDIT_NODE,
              payload: {
                id: aPayload.id,
                dx: aPayload.x - actionPayload.x,
                dy: aPayload.y - actionPayload.y,
              },
            };
          }
          return { ...action };
        });
        if (!keepGoing) {
          runner.next.event.actions = newActions;
        }
      }

      runner = runner.next ? runner.next.diff : null;
    }
  }

  private getPayload(action: IAction) {
    return action.payload as IAddNodeAction;
  }
}
