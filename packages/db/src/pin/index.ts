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

export async function updatePin(
  where: PinWhereUniqueInput,
  data: Partial<Pin>
) {
  return await client.pin.update({
    where,
    data,
  });
}
