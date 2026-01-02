import { NodeWhereUniqueInput } from "generated/models";
import { Node } from "../../generated/client";
import { client } from "../";
export async function getNodes(from: Date, to: Date) {
  return await client.node.findMany({
    include: {
      pins: {
        include: {
          rules: {
            include: {
              toClosePins: true,
              toOpenPins: true,
            },
          },
          plans: {
            where: {
              startDate: {
                gte: from,
                lte: to,
              },
            },
          },
        },
      },
    },
  });
}

export async function getNodeById(id: number) {
  return await client.node.findFirst({
    where: { id },
    include: { pins: true },
  });
}

export async function getOrCreateNodeByName(name: string) {
  const existingNode = await client.node.findFirst({
    where: { name },
    include: { pins: true },
  });
  if (existingNode) {
    return existingNode;
  }
  return await client.node.create({ data: { name }, include: { pins: true } });
}

export async function updateNode(
  where: NodeWhereUniqueInput,
  data: Partial<Node>
) {
  return await client.node.update({
    where,
    data,
  });
}
