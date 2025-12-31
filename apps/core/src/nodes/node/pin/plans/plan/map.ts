import { Plan as PlanSchema } from "db";
import { Plan } from "../plan";
import { PlanState } from "../../../../../states";
export function mapPlan(plansSchema: PlanSchema) {
  return new Plan({
    id: plansSchema.id,
    name: plansSchema.name,
    endDate: plansSchema.endDate!,
    startDate: plansSchema.startDate!,
    state: PlanState[plansSchema.state],
    toExtend: plansSchema.toExtend,
    toResume: plansSchema.toResume,
    pausedAt: plansSchema.pausedAt,
    stoppedAt: plansSchema.stoppedAt,
  });
}
