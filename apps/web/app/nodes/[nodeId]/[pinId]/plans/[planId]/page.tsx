import { getPlanById } from "db";
import Link from "next/link";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ pinId: string; nodeId: string }>;
}) {
  const { pinId, nodeId } = await params;
  const plan = await getPlanById(Number(pinId));
  if (!plan) {
    throw Error("No plan found");
  }
  return (
    <>
      <h2>Plan:</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <Link href={`/nodes/${nodeId}/${pinId}/rules/${plan.id}/update`}>
                {plan.name}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
