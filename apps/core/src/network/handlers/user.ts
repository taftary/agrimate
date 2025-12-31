import {
  AvailableTopicUserActions,
  publishToTopic,
  Topic_User_Actions,
  TopicParams,
  Topics,
} from "mqtt-network";
import { Main } from "../../main";
import { PlanCreateInput, RuleCreateInput } from "db/dist/generated/models";
import {
  createPlan,
  createRule,
  updatePlan,
  updateRule,
  Plan as PlanSchema,
  Rule as RuleSchema,
  Pin as PinSchema,
} from "db";
import { mapPlan } from "../../nodes/node/pin/plans/plan/map";
import { mapRule } from "../../nodes/node/pin/rules/rule/map";
import { PinState } from "../../states";

type UserActionHandlers = Record<
  AvailableTopicUserActions,
  (
    nodeName: string,
    pinName: string,
    message: Buffer<ArrayBufferLike>
  ) => Promise<void>
> & {
  getAction: (
    params: NonNullable<TopicParams>
  ) => Promise<AvailableTopicUserActions>;
};
export function userHandlers(main: Main): UserActionHandlers {
  return {
    getAction: async function (params) {
      const action = Object.values(Topic_User_Actions).find(
        (value) => value === params.action
      );
      if (!action) {
        throw Error(
          "<TopicUser> - No Known Action found to handle in Topic: " +
            params?.topic
        );
      }
      return action;
    },
    rule: async (nodeName, pinName, message) => {
      const ruleOptions = JSON.parse(message.toString()) as RuleCreateInput & {
        id?: number;
      };
      let newRuleSchema: RuleSchema & {
        toClosePins: Array<PinSchema>;
        toOpenPins: Array<PinSchema>;
      };
      if (ruleOptions?.id) {
        newRuleSchema = await updateRule({ id: ruleOptions.id }, ruleOptions);
      } else {
        newRuleSchema = await createRule(ruleOptions);
      }
      if (!newRuleSchema) {
        throw Error("<Topic_User> no plan Created in db!");
      }
      const newRule = mapRule(newRuleSchema, main.nodes);
      const pin = main.nodes.getNodeByName(nodeName)?.getPinByName(pinName);
      if (!pin) {
        throw Error("<Topic_User> no pin found to apply rule");
      }
      pin.rules.add(newRule);
      if (pin.state === PinState.ON) {
        newRule.activate();
      }
      publishToTopic(
        `${Topics.node}/${nodeName}/${pinName}/rule`,
        JSON.stringify(newRuleSchema)
      );
    },
    plan: async (nodeName, pinName, message) => {
      const planOptions = JSON.parse(message.toString()) as PlanCreateInput & {
        id?: number;
      };
      let newPlanSchema: PlanSchema;
      if (planOptions?.id) {
        newPlanSchema = await updatePlan({ id: planOptions.id }, planOptions);
      } else {
        newPlanSchema = await createPlan(planOptions);
      }
      if (!newPlanSchema) {
        throw Error("<Topic_User> no plan Created in db!");
      }
      const newPlan = mapPlan(newPlanSchema);
      if (newPlan.isDatePlan(new Date())) {
        const pin = main.nodes.getNodeByName(nodeName)?.getPinByName(pinName);
        if (!pin) {
          throw Error("<Topic_User> no pin found to apply plan");
        }
        pin.plans.add(newPlan);
        newPlan.execute(pin);
      }
      publishToTopic(
        `${Topics.node}/${nodeName}/${pinName}/plan`,
        JSON.stringify(newPlanSchema)
      );
    },
  };
}
