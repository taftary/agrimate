import { Nodes } from "./nodes";

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

  
}
