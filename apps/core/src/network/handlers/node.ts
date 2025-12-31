import {
  AvailableTopicNodeActions,
  Topic_Node_Actions,
  TopicParams,
  Topics,
} from "mqtt-network";
import { Main } from "../../main";

type NodeActionHandlers = Record<
  AvailableTopicNodeActions,
  (name: string, message: Buffer<ArrayBufferLike>) => Promise<void>
> & {
  getAction: (
    params: NonNullable<TopicParams>
  ) => Promise<AvailableTopicNodeActions>;
};
export function nodeHandlers(main: Main): NodeActionHandlers {
  return {
    getAction: async function (params) {
      const action = Object.values(Topic_Node_Actions).find(
        (value) => value === params.action
      );
      if (!action) {
        throw Error(
          "<TopicNode> - No Known Action found to handle in Topic: " +
            params?.topic
        );
      }
      return action;
    },
    state: async (name, message) => {
      const state = message.toString();
      const node = await main.nodes.getOrCreateNodeByName(name);
      if (state === "online") {
        await node.connect();
      } else {
        await node.disconnect();
      }
    },
    infos: async (name, message) => {
      const pins = JSON.parse(message.toString());
      const node = main.nodes.getNodeByName(name);
      if (!node) {
        throw Error("<MQTT><Action><Infos> - no node found for: " + name);
      }
      for (const pinName of Object.keys(pins)) {
        const value = pins[pinName];
        let pin = await node.getOrCreatePinByName(pinName);
        if (value === "ON") {
          pin.on();
        } else {
          pin.off();
        }
      }
    },
  };
}
