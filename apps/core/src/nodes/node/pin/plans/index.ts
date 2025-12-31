import { clear } from "console";
import { Pin } from "..";
import { PlanState } from "../../../../states";
import { Plan } from "./plan";

export interface PlansOptions {
  plans: Map<number, Plan>;
}

export class Plans {
  public readonly plans: Map<number, Plan>;
  constructor(options: PlansOptions) {
    this.plans = options.plans;
  }
  hasActivePlan(): boolean {
    return Array.from(this.plans.values()).some(
      (plan) => plan.state === PlanState.ACTIVE
    );
  }
  execute(date: Date, pin: Pin): void {
    for (const plan of this.plans.values()) {
      if (plan.isDatePlan(date)) {
        plan.execute(pin);
      }
    }
  }
  add(plan: Plan): void {
    this.plans.set(plan.id, plan);
  }
  remove(plan: Plan): void {
    this.plans.delete(plan.id);
  }
  list(): Plan[] {
    return Array.from(this.plans.values());
  }
}
