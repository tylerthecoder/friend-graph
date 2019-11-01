import { eventDiff, TIME_0, TIME_3 } from "../../../../testing/test-data";
import { IConnectionType } from "../../../../types";
import {
  emptyGraphState,
  moveToNextEvent,
  moveToPrevEvent,
  moveToTime,
} from "../../../events/functions";
import { applyActionAndUpdate, IAction } from "../../functions";
import { IActionType } from "../action-types";
import AddCon from "./add-con";

const ADD_TYLER_CARTER_CON_1: IAction = {
  type: IActionType.ADD_CON,
  id: "3",
  addConPayload: {
    startId: "tyler",
    endId: "carter",
    type: IConnectionType.FRIEND,
    weight: 1,
  },
};

const ADD_TYLER_CARTER_CON_2: IAction = {
  type: IActionType.ADD_CON,
  id: "4",
  addConPayload: {
    startId: "tyler",
    endId: "carter",
    type: IConnectionType.FRIEND,
    weight: 3,
  },
};

describe("Add Connection", () => {
  it("Applies Action", () => {
    let [found, GS, ED] = moveToTime(emptyGraphState, eventDiff, TIME_3);
    [GS, ED] = applyActionAndUpdate(ADD_TYLER_CARTER_CON_1, GS, ED);

    expect(Object.values(GS.connections).length).toBe(1);

    // move back and forth
    [GS, ED] = moveToNextEvent(GS, ED);
    [GS, ED] = moveToPrevEvent(GS, ED);

    expect(Object.values(GS.connections).length).toBe(1);
  });

  it("Changes add_con if ids are the same", () => {
    let [found, GS, ED] = moveToTime(emptyGraphState, eventDiff, TIME_3);
    [GS, ED] = applyActionAndUpdate(ADD_TYLER_CARTER_CON_1, GS, ED);
    [GS, ED] = moveToPrevEvent(GS, ED);

    [GS, ED] = applyActionAndUpdate(ADD_TYLER_CARTER_CON_2, GS, ED);

    const expectedAction: IAction = {
      type: IActionType.EDIT_CON,
      id: "3",
      editConPayload: {
        startId: "tyler",
        endId: "carter",
        dw: 2,
      },
    };

    expect(ED.next!.event.actions[1]).toEqual(expectedAction);
  });
});
