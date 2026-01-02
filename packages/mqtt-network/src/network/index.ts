import mqtt, { IClientOptions, MqttClient } from "mqtt";

let client: MqttClient;

export async function connectToBroker(
  options?: IClientOptions,
  url = process.env.MQTT_BROKER_URL
): Promise<void> {
  if (!url) {
    throw Error("No MQTT_BROKER_URL defined");
  }
  client = await mqtt.connectAsync(url, options);
}
export function subscribeToTopic(
  topic: string,
  onSuccess = (topic: string) => {},
  onError = (error: unknown) => {}
): void {
  client.subscribe(topic, (error) => {
    if (error) {
      onError(error);
    } else {
      onSuccess(topic);
    }
  });
}

export function publishToTopic(
  topic: string,
  message: string | Buffer<ArrayBufferLike>
): void {
  client.publish(topic, message);
}

export function onMessage(
  messageHandler: (topic: string, message: Buffer) => void
): void {
  client.on("message", messageHandler);
}

export function disconnectFromBroker(onDisconnect: () => void): void {
  client.end(onDisconnect);
}
