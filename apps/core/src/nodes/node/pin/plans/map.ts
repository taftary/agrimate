import { Plan as PlanSchema } from "db";
import { Plan } from "./plan";
import { mapPlan } from "./plan/map";

export function mapPlans(plansSchema: Array<PlanSchema>): Map<number, Plan> {
  const plans = new Map();
  for (const planData of plansSchema) {
    const plan = mapPlan(planData);
    plans.set(plan.id, plan);
  }
  return plans;
}
