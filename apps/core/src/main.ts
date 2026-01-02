import { publishToTopic, Topics } from "mqtt-network";
import { Nodes } from "./nodes";
import { NodeState, PlanState, RuleState } from "./states";

export class Main {
  public readonly nodes: Nodes;
  public timer: NodeJS.Timeout | null = null;
  constructor(nodes: Nodes = new Nodes()) {
    this.nodes = nodes;
  }

  async process(): Promise<void> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const node of this.nodes.list()) {
      await node.executePlans(now);
    }
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    const delay = nextDay.getTime() - now.getTime();
    this.timer = setTimeout(() => this.process(), delay);
  }
  async rest() {
    for (const node of this.nodes.list()) {
      for (const pin of node.getPins()) {
        for (const plan of pin.plans.list()) {
          if (plan.state === PlanState.ACTIVE) {
            if (plan.toResume) {
              await plan.pause(pin);
            } else {
              await plan.stop(pin);
            }
          }
        }
        for (const rule of pin.rules.list()) {
          if (rule.state === RuleState.ACTIVE) {
            await rule.deactivate();
          }
        }
        await pin.off();
      }
      await node.disconnect();
      publishToTopic(`${Topics.core}/${node.name}`, "reset");
    }
  }
}
