import { IGraphState } from "../types";

export function getNodeIds(graphState: IGraphState) {
  return Object.values(graphState.nodes).map((n) => n.id);
}
