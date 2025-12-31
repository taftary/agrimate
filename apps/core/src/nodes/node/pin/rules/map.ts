import { Rule as RuleSchema, Pin as PinSchema } from "db";
import { Rule } from "./rule";
import { Nodes } from "../../..";
import { mapRule } from "./rule/map";

export function mapRules(
  rulesSchema: Array<
    RuleSchema & {
      toClosePins: Array<PinSchema>;
      toOpenPins: Array<PinSchema>;
    }
  >,
  nodes: Nodes
): Map<number, Rule> {
  const rules = new Map();
  for (const ruleData of rulesSchema) {
    const rule = mapRule(ruleData, nodes);
    rules.set(rule.id, rule);
  }
  return rules;
}
