import {
  AvailableTopicNodeActions,
  connectToBroker,
  extractTopicParams,
  onMessage,
  subscribeToTopic,
  Topic_Node_Actions,
  TopicParams,
  Topics,
} from "mqtt-network";
import { Main } from "./main";
import { Nodes } from "./nodes";
import { startDashboard } from "./screen";
import { checkLogsHistory, logError, logInfo } from "./screen/logger";
import { startNetwork } from "./network";

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
      await connectToBroker({
        clientId: "core",
      });
      await startNetwork(main);
      await main.rest();
      await main.process();
    } catch (error) {
      logError(error as string);
    }
  })
  .catch((error) => {
    logError("Error fetching nodes:" + error);
  });
