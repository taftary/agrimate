"use client";

import mqtt from "mqtt";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CreatePlanPage() {
  const [name, setName] = useState<string>();
  const clientRef = useRef<mqtt.MqttClient>(null);
  const [state, setState] = useState<"loading" | "done" | "error">();
  const { pinId, nodeId } = useParams<{ pinId: string; nodeId: string }>();

  async function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      state: form.get("state"),
      pinId: Number(form.get("pinId")),
      startDate: form.get("startDate") || null,
      endDate: form.get("endDate") || null,
      toResume: form.get("toResume") === "on",
      toExtend: form.get("toExtend") === "on",
    };
    clientRef.current?.publish(
      `user/${nodeId}/${pinId}/plan`,
      JSON.stringify(payload)
    );
    setState("loading");
    setName(payload.name as string);
  }
  const handleOnMessage = useCallback(
    function (topic: string, message: Buffer<ArrayBufferLike>) {
      if (topic === `node/${nodeId}/${pinId}/plan`) {
        const data = JSON.parse(message.toString());
        if (data?.name === name && state === "loading") {
          setState("done");
        }
      }
    },
    [name, state, nodeId, pinId]
  );

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = mqtt.connect("ws://192.168.1.174:1884", {
        clientId: "test",
      });
      clientRef.current.on("message", handleOnMessage);
      clientRef.current.on("error", (error) => {
        console.error(error);
      });
      return () => {
        if (clientRef.current) {
          clientRef.current.unsubscribe("test");
          clientRef.current.end();
        }
      };
    }
  }, [handleOnMessage]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create Plan</h1>

      <form
        onSubmit={handleOnSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            name="name"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Plan name"
          />
        </div>

        {/* State */}
        <div>
          <label className="block font-medium">State</label>
          <select name="state" className="w-full border rounded px-3 py-2">
            <option value="SCHEDUAL">SCHEDUAL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="STOPPED">STOPPED</option>
          </select>
        </div>

        {/* Pin */}
        <div>
          <label className="block font-medium">Pin</label>
          <input type="number" min={0} name="pinId" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Booleans */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="toResume" />
            <span>To Resume</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="toExtend" />
            <span>To Extend</span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Create Plan
        </button>
      </form>
    </div>
  );
}
