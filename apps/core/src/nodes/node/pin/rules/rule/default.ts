import { Pin } from "../..";
import { PlanState } from "../../../../../states";


export function defaultRuleAction(pin: Pin): void {
  for (const plan of pin.plans.list()) {
    if (plan.state === PlanState.ACTIVE) {
      if (plan.toResume) {
        plan.pause(pin);
      } else {
        plan.stop(pin);
      }
    }
  }
}
export function defaultRuleEnd(pin: Pin): void {
  for (const plan of pin.plans.list()) {
    if (plan.state === PlanState.PAUSED) {
      plan.resume(pin);
    }
  }
}
