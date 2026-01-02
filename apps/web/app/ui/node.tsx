"use client";
import { Node as NodeSchema, Pin, Plan, Rule } from "db";

type NodeProps = {
  node: NodeSchema & {
    pins: Array<
      Pin & {
        rules: Array<
          Rule & { toClosePins: Array<Pin>; toOpenPins: Array<Pin> }
        >;
        plans: Array<Plan>;
      }
    >;
  };
};
export default function Node({ node }: NodeProps) {
  return (
    <table className="w-xl">
      <thead>
        <tr>
          <th>name</th>
          <th>state</th>
        </tr>
      </thead>
      <tbody>
        {node.pins.map((pin) => (
          <tr key={pin.id}>
            <td className="border">{pin.name}</td>
            <td className="border">{pin.state}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
