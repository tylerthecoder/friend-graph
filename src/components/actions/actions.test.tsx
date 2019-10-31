import { IGraphState } from "../../types.js";
import { applyAction, IAction, IActionType } from "./functions";

describe("Actions", () => {
  it("Applies Action", () => {
    let GS: IGraphState = {
      time: 5,
      nodes: {
        tyler: {
          id: "tyler",
          x: 0,
          y: 0,
          img: "",
        },
      },
      connections: {},
    };
    const action: IAction = {
      type: IActionType.RM_NODE,
      id: "0",
      payload: {
        id: "tyler",
      },
    };

    GS = applyAction(GS, action);

    expect(Object.values(GS.nodes).length).toBe(0);
  });
});
