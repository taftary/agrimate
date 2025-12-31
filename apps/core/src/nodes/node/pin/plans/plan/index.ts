import { updatePlan } from "db";
import { Pin } from "../..";
import { PlanState } from "../../../../../states";

export interface PlanOptions {
  name: string;
  id: number;
  startDate?: Date;
  state?: PlanState;
  endDate?: Date;
  toResume?: boolean;
  toExtend?: boolean;
  stoppedAt?: Date | null;
  pausedAt?: Date | null;
}

export class Plan {
  public readonly name: string;
  public readonly id: number;

  public state: PlanState;
  public startDate: Date;
  public endDate: Date;
  public stoppedAt: Date | null | undefined = null;
  public pausedAt: Date | null | undefined = null;
  public toResume: boolean;
  public toExtend: boolean;
  public timerStart: NodeJS.Timeout | null = null;
  public timerEnd: NodeJS.Timeout | null = null;

  constructor(options: PlanOptions) {
    this.name = options.name;
    this.id = options.id;
    const now = new Date();
    this.startDate = options.startDate ?? now;
    this.endDate = options.endDate ?? now;
    this.toResume = options.toResume ?? false;
    this.toExtend = options.toExtend ?? false;
    this.state = options.state ?? PlanState.SCHEDUAL;
    this.pausedAt = options.pausedAt;
    this.stoppedAt = options.stoppedAt;
  }
  async fetch() {
    await updatePlan(
      { id: this.id },
      {
        state: this.state,
        startDate: this.startDate,
        endDate: this.endDate,
        pausedAt: this.pausedAt,
        stoppedAt: this.stoppedAt,
      }
    );
  }

  async start(pin: Pin): Promise<void> {
    if (pin.hasRule) {
      if (this.toResume) {
        await this.pause(pin);
      } else {
        await this.stop(pin);
      }
    } else {
      this.state = PlanState.ACTIVE;
      await pin.on();
    }
    await this.fetch();
  }

  async pause(pin: Pin): Promise<void> {
    this.state = PlanState.PAUSED;
    this.pausedAt = new Date();
    await pin.off();
    this.clearTimers();
    await this.fetch();
  }
  async resume(pin: Pin): Promise<void> {
    if (!pin.hasRule) {
      if (this.pausedAt) {
        const now = new Date();
        if (this.toExtend) {
          const remainingDuration =
            this.endDate.getTime() - this.pausedAt.getTime();
          this.startDate = now;
          this.endDate = new Date(now.getTime() + remainingDuration);
        } else {
          this.startDate = now;
        }
      }
      await this.start(pin);
      const period = this.endDate.getTime() - this.startDate.getTime();
      this.timerEnd = setTimeout(async () => {
        await this.complete(pin);
      }, period);
    } else {
      await this.pause(pin);
    }
  }

  async stop(pin: Pin): Promise<void> {
    this.state = PlanState.STOPPED;
    this.stoppedAt = new Date();
    await pin.off();
    this.clearTimers();
    await this.fetch();
    pin.plans.remove(this);
  }

  async complete(pin: Pin): Promise<void> {
    this.state = PlanState.DONE;
    if (!pin.plans.hasActivePlan()) {
      await pin.off();
    }
    this.clearTimers();
    await this.fetch();
    pin.plans.remove(this);
  }

  isDatePlan(date: Date): boolean {
    return (
      this.startDate.getFullYear() === date.getFullYear() &&
      this.startDate.getMonth() === date.getMonth() &&
      this.startDate.getDate() === date.getDate() &&
      this.startDate.getTime() >= date.getTime()
    );
  }

  async execute(pin: Pin): Promise<void> {
    const now = new Date();
    let period = this.endDate.getTime() - this.startDate.getTime();
    if (period <= 0) {
      await this.complete(pin);
    }

    let startDelay = this.startDate.getTime() - now.getTime();
    if (startDelay < 0) {
      // notify user
      startDelay = 0;
    }
    this.timerStart = setTimeout(async () => {
      await this.start(pin);
    }, startDelay);
    this.timerEnd = setTimeout(async () => {
      await this.complete(pin);
    }, period + startDelay);
  }

  clearTimers(): void {
    if (this.timerEnd !== null) {
      clearTimeout(this.timerEnd);
      this.timerEnd = null;
    }
    if (this.timerStart !== null) {
      clearTimeout(this.timerStart);
      this.timerStart = null;
    }
  }
}
