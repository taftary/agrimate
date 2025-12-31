import { updatePin } from "db";
import { PinState } from "../../../states";
import { Plans } from "./plans";
import { Rules } from "./rules";
import { Rule } from "./rules/rule";

export interface PinOptions {
  id: number;
  name?: string;
  state?: PinState;
  hasRule: boolean;
  rules: Rules;
  plans: Plans;
}

export class Pin {
  public readonly id: number;
  public readonly name?: string;
  public state: PinState;
  public hasRule: boolean;
  public rules: Rules;
  public plans: Plans;

  constructor(options: PinOptions) {
    this.id = options.id;
    this.name = options.name;
    this.hasRule = options.hasRule;
    this.state = options.state ?? PinState.OFF;
    this.rules = options.rules;
    this.plans = options.plans;
  }

  async on(): Promise<void> {
    this.state = PinState.ON;
    this.rules.process(this.state);
    await updatePin({ id: this.id }, { state: this.state });
  }

  async off(): Promise<void> {
    this.state = PinState.OFF;
    this.rules.process(this.state);
    await updatePin({ id: this.id }, { state: this.state });
  }
}
