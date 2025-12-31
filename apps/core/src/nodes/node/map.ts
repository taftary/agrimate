import {
  Node as NodeSchema,
  Pin as PinSchema,
} from "db";
import { Pin } from "./pin";
import { Node, NodeOptions } from ".";
import mapPin from "./pin/map";
function mapNode(
  nodeSchema: NodeSchema & {
    pins: Array<PinSchema>;
  }
): Node {
  const pins = new Map<number, Pin>();
  for (const pinData of nodeSchema.pins) {
    const pin = mapPin(pinData);
    pins.set(pin.id, pin);
  }
  const nodeOptions: NodeOptions = {
    id: nodeSchema.id,
    name: nodeSchema.name,
    pins,
  };
  return new Node(nodeOptions);
}
export default mapNode;
