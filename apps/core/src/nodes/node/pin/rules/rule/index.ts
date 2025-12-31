import { updateRule } from "db";
import { Pin } from "../..";
import { PinState, PlanState, RuleState } from "../../../../../states";

export type RuleCondition = (
  originPin: Pin,
  toClosePin: Pin
) => boolean | Promise<boolean>;
export type RuleAction = (toClosePin: Pin) => void | Promise<void>;

export interface RuleOptions {
  name: string;
  id: number;
  state: RuleState;
  toClosePins: Map<number, Pin>;
  toOpenPins: Map<number, Pin>;
  priority: number;
}

export class Rule {
  public readonly name: string;
  public readonly id: number;
  public state: RuleState;
  public readonly toClosePins: Map<number, Pin>;
  public readonly toOpenPins: Map<number, Pin>;
  public priority: number;

  constructor(options: RuleOptions) {
    this.name = options.name;
    this.id = options.id;
    this.state = options.state;
    this.priority = options.priority;
    this.toClosePins = options.toClosePins;
    this.toOpenPins = options.toOpenPins;
  }
  closePins(): void {
    for (const toClosePin of this.toClosePins.values()) {
      if (toClosePin.plans.hasActivePlan()) {
        for (const plan of toClosePin.plans.list()) {
          if (plan.state === PlanState.ACTIVE) {
            if (plan.toResume) {
              plan.pause(toClosePin);
            } else {
              plan.stop(toClosePin);
            }
          }
        }
      } else {
        toClosePin.off();
      }
      toClosePin.hasRule = true;
    }
  }
  resetClosedPins(): void {
    for (const toClosePin of this.toClosePins.values()) {
      toClosePin.hasRule = false;
      for (const plan of toClosePin.plans.list()) {
        if (plan.state === PlanState.PAUSED) {
          plan.resume(toClosePin);
        }
      }
    }
  }
  openPins(): void {
    for (const toOpenPin of this.toOpenPins.values()) {
      toOpenPin.hasRule = true;
      toOpenPin.on();
    }
  }

  resetOpenedPins(): void {
    for (const toOpenPin of this.toOpenPins.values()) {
      toOpenPin.hasRule = false;
      if (toOpenPin.state === PinState.ON && !toOpenPin.plans.hasActivePlan()) {
        toOpenPin.off();
      }
    }
  }

  async activate(): Promise<void> {
    this.state = RuleState.ACTIVE;
    this.closePins();
    this.openPins();
    await updateRule({ id: this.id }, { state: this.state });
  }

  async deactivate(): Promise<void> {
    this.state = RuleState.INACTIVE;
    this.resetClosedPins();
    this.resetOpenedPins();
    await updateRule({ id: this.id }, { state: this.state });
  }
  addToClosePin(pin: Pin) {
    this.toClosePins.set(pin.id, pin);
  }
  addToOpenPin(pin: Pin) {
    this.toOpenPins.set(pin.id, pin);
  }
}
