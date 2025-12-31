import { Rule as RuleSchema, Pin as PinSchema } from "db";
import { Rule } from "../rule";
import { RuleState } from "../../../../../states";
import { Nodes } from "../../../..";

export function mapRule(
  ruleSchema: RuleSchema & {
    toClosePins: Array<PinSchema>;
    toOpenPins: Array<PinSchema>;
  },
  nodes: Nodes
) {
  const rule = new Rule({
    id: ruleSchema.id,
    name: ruleSchema.name,
    state: RuleState[ruleSchema.state],
    priority: ruleSchema.priority,
    toClosePins: new Map(),
    toOpenPins: new Map(),
  });
  for (const toOpenPinData of ruleSchema.toOpenPins) {
    const toOpenPin = nodes.getPinById(toOpenPinData.id);
    if (toOpenPin) {
      rule.addToOpenPin(toOpenPin);
    }
  }
  for (const toClosePinData of ruleSchema.toClosePins) {
    const toClosePin = nodes.getPinById(toClosePinData.id);
    if (toClosePin) {
      rule.addToClosePin(toClosePin);
    }
  }
  return rule;
}
