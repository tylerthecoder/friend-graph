import testData from "../../data/test.json";
import { IEvent, IGraphState } from "../../types";
import {
  addGhostNode,
  bustGhost,
  emptyGraphState,
  EventDiff,
  makeEventDiffList,
  moveToNextEvent,
  moveToPrevEvent,
  moveToTime,
} from "./functions";

const events = testData as IEvent[];

const TIME_0 = 1494392400000;
const TIME_1 = 1496293200000;
const TIME_2 = 1496379600000;
const NOT_DEFINED_TIME = 1496466000000;
const TIME_3 = 1496552400000;
const TIME_4 = 1496638800000;
const OUT_OF_BOUNDS_TIME = 1496725200000;

const NODES_1 = ["tyler"];
const NODES_2 = ["tyler", "carter"];
const NODES_3 = ["tyler", "carter", "will"];
const ALL_NODE_IDS = ["621", "tyler", "carter", "will"];

function getNodeIds(graphState: IGraphState) {
  return Object.values(graphState.nodes).map((n) => n.id);
}

describe("Events", () => {
  let ED: EventDiff;
  let GS: IGraphState;
  beforeAll(() => {
    ED = makeEventDiffList(events);
    GS = emptyGraphState;
  });

  it("Goes Forward", () => {
    const [newGS, newED] = moveToNextEvent(GS, ED);

    expect(Object.values(newGS.nodes)[0].id).toBe("tyler");
  });

  describe("Seek to dates", () => {
    it("Seeks to date if time does exist", () => {
      const [found, tGS, tED] = moveToTime(GS, ED, TIME_2);

      expect(found).toBe(true);
      expect(tGS.time).toBe(TIME_2);
      expect(getNodeIds(tGS)).toEqual(NODES_2);
    });

    it("Seek to prev state if time does not exist", () => {
      const [found, newGS, newED] = moveToTime(GS, ED, NOT_DEFINED_TIME);

      expect(found).toBe(false);
      expect(newGS.time).toBe(TIME_2);
      expect(getNodeIds(newGS)).toEqual(NODES_2);

      const [forwardGS, forwardED] = moveToNextEvent(newGS, newED);
      expect(getNodeIds(forwardGS)).toEqual(NODES_3);
    });

    it("Seeks to date if time does exist and the node is near", () => {
      let [found, tGS, tED] = moveToTime(GS, ED, TIME_2);
      [found, tGS, tED] = moveToTime(tGS, tED, NOT_DEFINED_TIME);

      expect(found).toBe(false);
      expect(tGS.time).toBe(TIME_2);
      expect(getNodeIds(tGS)).toEqual(NODES_2);
    });

    it("Seeks to prev state even if going backwards", () => {
      const [_, startGS, startED] = moveToTime(GS, ED, TIME_4);
      const [found, newGS, newED] = moveToTime(
        startGS,
        startED,
        NOT_DEFINED_TIME,
      );

      expect(found).toBe(false);
      expect(newGS.time).toBe(TIME_2);
      expect(getNodeIds(newGS)).toEqual(NODES_2);
    });

    it("Seeks to beginning of time if date is before all events", () => {
      let [found, tGS, tED] = moveToTime(GS, ED, TIME_0);

      expect(found).toBe(false);
      expect(tGS.time).toBe(0);
      expect(getNodeIds(tGS)).toEqual([]);

      // going forward moves to first event
      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(tGS.time).toBe(TIME_1);
      expect(getNodeIds(tGS)).toEqual(NODES_1);
    });

    it("Seeks to beginning of time if date is before all events going backwards", () => {
      let [found, tGS, tED] = moveToTime(GS, ED, TIME_1);
      [found, tGS, tED] = moveToTime(tGS, tED, TIME_0);

      expect(found).toBe(false);
      expect(tGS.time).toBe(0);
      expect(getNodeIds(tGS)).toEqual([]);

      // going forward moves to first event
      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(tGS.time).toBe(TIME_1);
      expect(getNodeIds(tGS)).toEqual(NODES_1);
    });
  });

  describe("Does ghosty things", () => {
    describe("Add node when moving forward", () => {
      let ghostGS: IGraphState;
      let ghostED: EventDiff;
      beforeAll(() => {
        const [_, tGS, tED] = moveToTime(GS, ED, NOT_DEFINED_TIME);
        [ghostGS, ghostED] = addGhostNode(tGS, tED, NOT_DEFINED_TIME);

        expect(ghostGS.time).toBe(NOT_DEFINED_TIME);
        expect(getNodeIds(ghostGS)).toEqual(NODES_2);
        expect(ghostED.next!.event.actions.length).toBe(1);
      });

      it("Correctly goes forward afterward", () => {
        // going forward should add Will
        let [forwardGS, forwardED] = moveToNextEvent(ghostGS, ghostED);
        expect(getNodeIds(forwardGS)).toEqual(NODES_3);
        expect(forwardGS.time).toBe(TIME_3);

        // moving back forward should not change anything
        [forwardGS, forwardED] = moveToPrevEvent(forwardGS, forwardED);
        expect(getNodeIds(forwardGS)).toEqual(NODES_2);
      });

      it("Correctly goes backward afterward", () => {
        // going backward should have the same graph state
        let [backGS, backED] = moveToPrevEvent(ghostGS, ghostED);
        expect(getNodeIds(backGS)).toEqual(NODES_2);
        expect(backGS.time).toBe(TIME_2);

        // moving back should not change anything
        [backGS, backED] = moveToNextEvent(backGS, backED);
        expect(getNodeIds(backGS)).toEqual(NODES_2);
      });

      describe("Removes the ghost node", () => {
        let bustedGS: IGraphState;
        let bustedED: EventDiff;
        let foundGhost: boolean;
        beforeAll(() => {
          [foundGhost, bustedGS, bustedED] = bustGhost(ghostGS, ghostED);
          expect(bustedGS.time).toBe(TIME_2);
          expect(foundGhost).toBe(true);

          it("Correctly goes forwards afterwards", () => {
            const [tGS, tED] = moveToNextEvent(bustedGS, bustedED);
            expect(tGS.time).toBe(TIME_3);
          });
        });
      });
    });

    it("Adds ghost node when time is out of bounds", () => {
      let [_, tGS, tED] = moveToTime(GS, ED, OUT_OF_BOUNDS_TIME);
      [tGS, tED] = addGhostNode(tGS, tED, OUT_OF_BOUNDS_TIME);

      expect(tGS.time).toBe(OUT_OF_BOUNDS_TIME);
      expect(getNodeIds(tGS)).toEqual(ALL_NODE_IDS);
      expect(tED.next).toBe(null);

      // Going forward should not change the node ids
      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(getNodeIds(tGS)).toEqual(ALL_NODE_IDS);
    });

    it("Adds ghost when time is before all events", () => {
      let [_, tGS, tED] = moveToTime(GS, ED, TIME_0);
      [tGS, tED] = addGhostNode(tGS, tED, TIME_0);

      expect(tGS.time).toBe(TIME_0);
      expect(getNodeIds(tGS)).toEqual([]);

      // going forward should put at first event
      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(getNodeIds(tGS)).toEqual(NODES_1);
      expect(tGS.time).toBe(TIME_1);

      // going back should put us back in the same place
      [tGS, tED] = moveToPrevEvent(tGS, tED);
      expect(getNodeIds(tGS)).toEqual([]);
      expect(tGS.time).toBe(TIME_0);

      // removing node should work
      [_, tGS, tED] = bustGhost(tGS, tED);
      expect(getNodeIds(tGS)).toEqual([]);
      expect(tGS.time).toBe(0);

      // moving forward should move to first event
      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(getNodeIds(tGS)).toEqual(NODES_1);
      expect(tGS.time).toBe(TIME_1);
    });

    it("Adds ghost when time is before all events and moving backwards", () => {
      let [_, tGS, tED] = moveToTime(GS, ED, TIME_1);
      [_, tGS, tED] = moveToTime(tGS, tED, TIME_0);
      [tGS, tED] = addGhostNode(tGS, tED, TIME_0);
      expect(tGS.time).toBe(TIME_0);

      [_, tGS, tED] = bustGhost(tGS, tED);
      expect(tGS.time).toBe(0);

      [tGS, tED] = moveToNextEvent(tGS, tED);
      expect(tGS.time).toBe(TIME_1);
      expect(getNodeIds(tGS)).toEqual(NODES_1);
    });
  });
});
