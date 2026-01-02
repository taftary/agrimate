import { getNodeById } from "db";
import Link from "next/link";

export default async function NodePage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {

  const { nodeId } = await params;
  const node = await getNodeById(Number(nodeId));

  if (!node) {
    throw Error("No node found");
  }
  return (
    <>
      <Link href={`/nodes`}>back</Link>
      <table className="w-xl text-left">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>pins</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{node.id}</td>
            <td>{node.name}</td>
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
                      <td className="border">
                        <Link href={`/nodes/${node.id}/${pin.id}`}>
                          {pin.name}
                        </Link>
                      </td>
                      <td className="border">{pin.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
