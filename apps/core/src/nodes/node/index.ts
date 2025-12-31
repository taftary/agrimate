import { getOrCreatePinByName, updateNode } from "db";
import { NodeState } from "../../states";
import { Pin } from "./pin";
import mapPin from "./pin/map";
import { logInfo } from "../../screen/logger";

export interface NodeOptions {
  id: number;
  name: string;
  pins: Map<number, Pin>;
}

export class Node {
  public readonly id: number;
  public readonly name: string;
  public state: NodeState = NodeState.DISCONNECTED;
  private readonly pins: Map<number, Pin>;
  constructor(options: NodeOptions) {
    this.id = options.id;
    this.name = options.name;
    this.pins = options.pins;
  }

  async connect(): Promise<void> {
    this.state = NodeState.CONNECTED;
    await updateNode({ id: this.id }, { state: this.state });
  }
  async disconnect(): Promise<void> {
    this.state = NodeState.DISCONNECTED;
    await updateNode({ id: this.id }, { state: this.state });
  }

  addPin(pin: Pin): void {
    this.pins.set(pin.id, pin);
  }

  removePin(pinId: number): boolean {
    return this.pins.delete(pinId);
  }

  getPin(pinId: number): Pin | undefined {
    return this.pins.get(pinId);
  }
  getPinByName(name: string): Pin | undefined {
    return this.getPins().find((pin) => pin.name === name);
  }
  async getOrCreatePinByName(name: string) {
    let pin = this.getPinByName(name);
    if (!pin) {
      const PinSchema = await getOrCreatePinByName(name, this.id);
      pin = mapPin(PinSchema);
      this.addPin(pin);
    }
    return pin;
  }

  getPins(): Pin[] {
    return Array.from(this.pins.values());
  }
  checkRules(originPin: Pin): void {
    for (const pin of this.pins.values()) {
      if (pin.id === originPin.id) {
        pin.rules.process(originPin.state);
      }
    }
  }
  async executePlans(date: Date): Promise<void> {
    for (const pin of this.pins.values()) {
      pin.plans.execute(date, pin);
    }
  }
}
