import { makeEventDiffList } from "../components/events/functions";
import testData from "../data/test.json";
import { IEvent } from "../types.js";
export const events = testData as IEvent[];
export const eventDiff = makeEventDiffList(events);

export const TIME_0 = 1494392400000;
export const TIME_1 = 1496293200000;
export const TIME_2 = 1496379600000;
export const NOT_DEFINED_TIME = 1496466000000;
export const TIME_3 = 1496552400000;
export const TIME_4 = 1496638800000;
export const OUT_OF_BOUNDS_TIME = 1496725200000;

export const NODES_1 = ["tyler"];
export const NODES_2 = ["tyler", "carter"];
export const NODES_3 = ["tyler", "carter", "will"];
export const ALL_NODE_IDS = ["621", "tyler", "carter", "will"];
