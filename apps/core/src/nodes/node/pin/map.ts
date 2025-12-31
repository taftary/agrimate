import { Pin as PinSchema, Rule as RuleSchema, Plan as PlanSchema } from "db";
import { Rule } from "./rules/rule";
import { Plan } from "./plans/plan";
import { Pin } from ".";
import { Plans } from "./plans";
import { Rules } from "./rules";
import { PinState, PlanState, RuleState } from "../../../states";

function mapPin(pinSchema: PinSchema): Pin {
  const rulesMap = new Map<number, Rule>();
  const plansMap = new Map<number, Plan>();
  return new Pin({
    id: pinSchema.id,
    name: pinSchema.name || undefined,
    state: PinState[pinSchema.state],
    rules: new Rules({ rules: rulesMap }),
    plans: new Plans({ plans: plansMap }),
    hasRule: pinSchema.hasRule,
  });
}

export default mapPin;
