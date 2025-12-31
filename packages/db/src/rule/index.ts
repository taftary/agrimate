import { client } from "../";
import {
  RuleCreateInput,
  RuleUpdateInput,
  RuleWhereUniqueInput,
} from "../../generated/models";

export async function updateRule(
  where: RuleWhereUniqueInput,
  data: RuleUpdateInput
) {
  return await client.rule.update({
    where,
    data,
    include: {
      toClosePins: true,
      toOpenPins: true,
    },
  });
}

export async function createRule(data: RuleCreateInput) {
  return await client.rule.create({
    data,
    include: {
      toClosePins: true,
      toOpenPins: true,
    },
  });
}
