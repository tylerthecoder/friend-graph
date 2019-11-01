import { eventDiff, TIME_0 } from "../../../../testing/test-data";
import { emptyGraphState, moveToTime } from "../../../events/functions";
import { applyActionAndUpdate, IAction } from "../../functions";
import { IActionType } from "../action-types";
import AddNode from "./add-node";

const actionClass = new AddNode();

const ADD_TYLER_NODE_ACTION: IAction = {
  type: IActionType.ADD_NODE,
  id: "123",
  payload: {
    id: "tyler",
    x: 200,
    y: 200,
    img: "test",
  },
};

describe("Add Node", () => {
  it("Applies Action", () => {
    let [found, GS, ED] = moveToTime(emptyGraphState, eventDiff, TIME_0);
    [GS, ED] = applyActionAndUpdate(ADD_TYLER_NODE_ACTION, GS, ED);

    const expectedAction: IAction = {
      type: IActionType.EDIT_NODE,
      id: "1",
      payload: {
        id: "tyler",
        dx: -100,
        dy: -100,
      },
    };

    expect(ED.next!.event.actions[0]).toEqual(expectedAction);
  });
});
