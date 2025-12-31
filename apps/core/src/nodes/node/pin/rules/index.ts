import { Pin } from "..";
import { logWarn } from "../../../../screen/logger";
import { PinState, RuleState } from "../../../../states";
import { Rule } from "./rule";

export interface PinOptions {
  rules: Map<number, Rule>;
}

export class Rules {
  public readonly rules: Map<number, Rule>;
  constructor(options: PinOptions) {
    this.rules = options.rules;
  }

  process(state: PinState): void {
    if (state === PinState.ON) {
      for (const rule of this.list()) {
        rule.activate();
      }
    } else {
      for (const rule of this.rules.values()) {
        rule.deactivate();
      }
    }
  }

  add(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }
  list(): Rule[] {
    return Array.from(this.rules.values());
  }
}
