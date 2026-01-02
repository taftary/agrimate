import { getPinRules } from "db";
import Link from "next/link";

export default async function RulesPage({
  params,
}: {
  params: Promise<{ pinId: string; nodeId: string }>;
}) {
  const { pinId, nodeId } = await params;
  const rules = await getPinRules(Number(pinId));
  return (
    <>
      <Link href={`/nodes/${nodeId}/${pinId}/rules/create`}>Create rule</Link>
      <h2>Rules:</h2>
      <table>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>
                <Link
                  href={`/nodes/${nodeId}/${pinId}/rules/${rule.id}/update`}
                >
                  {rule.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
