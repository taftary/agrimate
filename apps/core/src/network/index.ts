import {
  connectToBroker,
  extractTopicParams,
  onMessage,
  subscribeToTopic,
  Topics,
  
} from "mqtt-network";
import { Main } from "../main";
import { nodeHandlers } from "./handlers/node";
import { logInfo } from "../screen/logger";
import { userHandlers } from "./handlers/user";

export async function startNetwork(main: Main) {
  await connectToBroker({
    clientId: "core",
  });
  const nodeMessageHandlers = nodeHandlers(main);
  const userMessageHandlers = userHandlers(main);
  subscribeToTopic(`${Topics.node}/#`, (topic) => {
    logInfo(" - SUBSCRIBED TO: ", topic);
  });
  subscribeToTopic(`${Topics.user}/#`, (topic) => {
    logInfo(" - SUBSCRIBED TO: ", topic);
  });
  onMessage(async (topic, message) => {
    if (topic.startsWith(Topics.node)) {
      const params = extractTopicParams(":topic/:name/:action", topic);
      if (!params?.name || !params.action) {
        throw Error(
          "<TopicNode> - No Params name or action found to handle in Topic: " +
            params?.topic
        );
      }
      const action = await nodeMessageHandlers.getAction(params);
      await nodeMessageHandlers[action](params.name, message);
    } else if (topic.startsWith(Topics.user)) {
      const params = extractTopicParams(
        ":topic/:nodeName/:pinName/:action",
        topic
      );
      if (!params?.nodeName || !params?.pinName || !params?.action) {
        throw Error(
          "<TopicNode> - No Params action found to handle in Topic: " +
            params?.topic
        );
      }
      const action = await userMessageHandlers.getAction(params);
      await userMessageHandlers[action](
        params.nodeName,
        params.pinName,
        message
      );
    }
  });
}
