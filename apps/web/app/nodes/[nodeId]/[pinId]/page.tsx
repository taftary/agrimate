import { getPinById } from "db";
import Link from "next/link";

export default async function InPage({
  params,
}: {
  params: Promise<{ pinId: string }>;
}) {
  const { pinId } = await params;
  const pin = await getPinById(Number(pinId));
  if (!pin) {
    throw Error("No pin found");
  }
  return (
    <>
      <Link href={`/nodes/${pin.nodeId}`}>back</Link>
      <table className="w-xl">
        <thead>
          <tr>
            <th>name</th>
            <th>state</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border">{pin.name}</td>
            <td className="border">{pin.state}</td>
          </tr>
        </tbody>
      </table>
      <Link href={`/nodes/${pin.nodeId}/${pin.id}/rules/create`}>
        Create rule
      </Link>
      <h2>Rules:</h2>
      <table>
        <tbody>
          {pin.rules.map((rule) => (
            <tr key={rule.id}>
              <td>
                <Link
                  href={`/nodes/${pin.nodeId}/${pin.id}/rules/${rule.id}/update`}
                >
                  {rule.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/nodes/${pin.nodeId}/${pin.id}/plans/create`}>
        Create plan
      </Link>
      <h2>Plans:</h2>
      <table>
        <tbody>
          {pin.plans.map((plan) => (
            <tr key={plan.id}>
              <td>
                <Link
                  href={`/nodes/${pin.nodeId}/${pin.id}/plans/${plan.id}/update`}
                >
                  {plan.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
