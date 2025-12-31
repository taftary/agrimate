import { Main } from "./main";
import { Nodes } from "./nodes";
import { startDashboard } from "./screen";
import { checkLogsHistory, logError, logInfo, logWarn } from "./screen/logger";
import { RuleState } from "./states";

const from = new Date();
const to = new Date();
to.setDate(to.getDate() + 1);
to.setHours(0, 0, 0, 0);
const nodes = new Nodes();
logInfo("Fetching...");
nodes
  .fetch(from, to)
  .then(async () => {
    try {
      const main = new Main(nodes);
      startDashboard(main);
      checkLogsHistory();
      logInfo("Start");
      // TODO: RESET DB DATA and pin and rules data in classes all pins should be OFF and all rules should be inactive
      await main.process();

      // TODO: remove this is only for test
      for (const node of main.nodes.list()) {
        for (const pin of node.getPins()) {
          for (const rule of pin.rules.list()) {
            if (rule.state === RuleState.ACTIVE) {
              logWarn(
                "Checking Rule for: " +
                  rule.name +
                  " Pin origin: " +
                  pin.name +
                  " " +
                  pin.state
              );
              main.nodes.checkRules(pin);
            }
          }
        }
      }
    } catch (error) {
      logError(error as string);
    }
  })
  .catch((error) => {
    logError("Error fetching nodes:" + error);
  });
