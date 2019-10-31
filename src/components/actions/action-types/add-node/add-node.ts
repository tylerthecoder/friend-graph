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

    let runner: EventDiff | null = diff;
    let flag = false;
    while (runner && !flag) {
      if (
        runner.next &&
        runner.next.event.actions.some(
          (a) =>
            a.type === IActionType.ADD_NODE &&
            (a.payload as IAddNodeAction).id === payload.id,
        )
      ) {
        flag = true;
      }
      runner = runner.next ? runner.next.diff : null;
    }

    if (flag) {
      return {
        isValid: false,
        message: "Id already exists (Added later in the timeline)",
      };
    }

    return {
      isValid: true,
    };
  }

  private getPayload(action: IAction) {
    return action.payload as IAddNodeAction;
  }
}
