import { getPinPlans } from "db";
import Link from "next/link";

export default async function PlansPage({
  params,
}: {
  params: Promise<{ pinId: string; nodeId: string }>;
}) {
  const { pinId, nodeId } = await params;
  const plans = await getPinPlans(Number(pinId));
  return (
    <>
      <Link href={`/nodes/${nodeId}/${pinId}/plans/create`}>Create plan</Link>
      <h2>Plans:</h2>
      <table>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>
                <Link
                  href={`/nodes/${nodeId}/${pinId}/plans/${plan.id}/update`}
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
