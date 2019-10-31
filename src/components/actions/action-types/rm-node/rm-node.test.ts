import { getNodeIds } from "../../../../testing/helpers";
import { eventDiff } from "../../../../testing/test-data";
import {
  emptyGraphState,
  moveToNextEvent,
  moveToPrevEvent,
} from "../../../events/functions";
import {
  applyActionAndUpdate,
  cleanupEventDiffs,
  IAction,
} from "../../functions";
import { IActionType } from "../action-types";
import RmNode from "./rm-node";

const actionClass = new RmNode();

const RM_TYLER_NODE_ACTION: IAction = {
  type: IActionType.RM_NODE,
  id: "1",
  payload: {
    id: "tyler",
    x: 0,
    y: 0,
    img: "",
  },
};

const ADD_TYLER_CARTER_CONNECTION: IAction = {
  type: IActionType.ADD_CON,
  id: "2",
  payload: {
    startId: "carter",
    endId: "tyler",
    weight: 1,
  },
};

describe("Remove Node", () => {
  it("Applies Action", () => {
    let [GS, ED] = moveToNextEvent(emptyGraphState, eventDiff);
    [GS, ED] = moveToNextEvent(GS, ED);

    GS = actionClass.applyAction(GS, RM_TYLER_NODE_ACTION);
    ED = cleanupEventDiffs(ED, GS, RM_TYLER_NODE_ACTION);
    expect(getNodeIds(GS)).toEqual(["carter"]);

    // if we go back the node should re-appear

    [GS, ED] = moveToPrevEvent(GS, ED);
    expect(getNodeIds(GS)).toEqual(["tyler"]);
  });

  it("Removes bad actions", () => {
    // move forward thrice
    let [GS, ED] = moveToNextEvent(emptyGraphState, eventDiff);
    [GS, ED] = moveToNextEvent(GS, ED);
    [GS, ED] = moveToNextEvent(GS, ED);
    // add a connection and move back
    [GS, ED] = applyActionAndUpdate(ADD_TYLER_CARTER_CONNECTION, GS, ED);
    [GS, ED] = moveToPrevEvent(GS, ED);
    // remove node (add hopefully next connection)
    [GS, ED] = applyActionAndUpdate(RM_TYLER_NODE_ACTION, GS, ED);
    expect(getNodeIds(GS)).toEqual(["carter"]);

    [GS, ED] = moveToNextEvent(GS, ED);
    expect(getNodeIds(GS)).toEqual(["carter", "will"]);
    expect(Object.values(GS.connections).length).toBe(0);
  });
});
