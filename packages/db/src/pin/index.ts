import { PinWhereUniqueInput } from "../../generated/models";
import { Pin } from "../../generated/client";
import { client } from "../";

export async function getOrCreatePinByName(name: string, nodeId: number) {
  const pin = await client.pin.findFirst({ where: { name } });
  if (!pin) {
    return await client.pin.create({ data: { name, state: "OFF", nodeId } });
  } else {
    return pin;
  }
}

export async function getPinById(id: number) {
  return await client.pin.findFirst({
    where: { id },
    include: { plans: true, rules: true },
  });
}

export async function updatePin(
  where: PinWhereUniqueInput,
  data: Partial<Pin>
) {
  return await client.pin.update({
    where,
    data,
  });
}

export async function getPinPlans(pinId: number) {
  return await client.plan.findMany({ where: { pinId } });
}
export async function getPinRules(pinId: number) {
  return await client.rule.findMany({ where: { pinId } });
}
