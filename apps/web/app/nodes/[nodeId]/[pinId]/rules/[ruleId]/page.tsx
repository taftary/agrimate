import { getRuleById } from "db";
import Link from "next/link";

export default async function RulePage({
  params,
}: {
  params: Promise<{ pinId: string; nodeId: string }>;
}) {
  const { pinId, nodeId } = await params;
  const rule = await getRuleById(Number(pinId));
  if (!rule) {
    throw Error("No rule found");
  }
  return (
    <>
      <h2>Rule:</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <Link href={`/nodes/${nodeId}/${pinId}/rules/${rule.id}/update`}>
                {rule.name}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
