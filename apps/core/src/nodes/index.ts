import { getNodes, getOrCreateNodeByName } from "db";
import { Node } from "./node";
import mapNode from "./node/map";
import { Pin } from "./node/pin";
import { mapRules } from "./node/pin/rules/map";
import { mapPlans } from "./node/pin/plans/map";
import { Rules } from "./node/pin/rules";
import { Plans } from "./node/pin/plans";
import { logError } from "../screen/logger";

export class Nodes {
  private readonly nodes = new Map<number, Node>();

  async fetch(from: Date, to: Date): Promise<void> {
    const nodesData = await getNodes(from, to);
    for (const nodeData of nodesData) {
      this.addNode(mapNode(nodeData));
    }
    for (const nodeData of nodesData) {
      for (const pinData of nodeData.pins) {
        const pinRules = mapRules(pinData.rules, this);
        const pinPlans = mapPlans(pinData.plans);
        const pin = this.getNode(nodeData.id)?.getPin(pinData.id);
        if (pin) {
          pin.rules = new Rules({ rules: pinRules });
          pin.plans = new Plans({ plans: pinPlans });
        }
      }
    }
  }
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: number): boolean {
    return this.nodes.delete(nodeId);
  }

  getNode(nodeId: number): Node | undefined {
    return this.nodes.get(nodeId);
  }
  getNodeByName(name: string): Node | null {
    for (const node of this.list()) {
      if (node.name === name) {
        return node;
      }
    }
    return null;
  }

  list(): Node[] {
    return Array.from(this.nodes.values());
  }
  checkRules(originPin: Pin): void {
    for (const node of this.nodes.values()) {
      node.checkRules(originPin);
    }
  }

  getPinById(id: number): Pin | null {
    for (const node of this.list()) {
      const pin = node.getPin(id);
      if (pin) {
        return pin;
      }
    }
    return null;
  }
  async execute(date: Date): Promise<void> {
    try {
      for (const node of this.nodes.values()) {
        await node.executePlans(date);
      }
    } catch (err) {
      logError("Error executing date plans:" + err);
    }
  }
  async getOrCreateNodeByName(name: string): Promise<Node> {
    let node = this.getNodeByName(name);
    if (!node) {
      const nodeSchema = await getOrCreateNodeByName(name);
      node = mapNode(nodeSchema);
      this.addNode(node);
    }
    return node;
  }
}
