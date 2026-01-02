import { client } from "../";
import {
  PlanCreateInput,
  PlanUpdateInput,
  PlanWhereUniqueInput,
} from "../../generated/models";

export async function updatePlan(
  where: PlanWhereUniqueInput,
  data: PlanUpdateInput
) {
  return await client.plan.update({
    where,
    data,
  });
}

export async function createPlan(data: PlanCreateInput) {
  return await client.plan.create({ data });
}
export async function getPlanById(id: number) {
  return await client.plan.findUnique({ where: { id } });
}
