"use client";
import { Node, Pin, Plan, Rule } from "db";
import Link from "next/link";

type GraphViewProps = {
  nodes: Array<
    Node & {
      pins: Array<
        Pin & {
          rules: Array<
            Rule & { toClosePins: Array<Pin>; toOpenPins: Array<Pin> }
          >;
          plans: Array<Plan>;
        }
      >;
    }
  >;
};
export default function Nodes({ nodes }: GraphViewProps) {
  return (
    <>
      <Link href={`/`}>back</Link>
      <table className="w-xl text-left">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>state</th>
            <th>pins</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.id}>
              <td>{node.id}</td>
              <td>
                <Link href={`/nodes/${node.id}`}>{node.name}</Link>
              </td>
              <td>{node.state}</td>
              <td>
                <table className="w-full">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
