import { getNodes } from "db";
import Nodes from "../ui/nodes";

export default async function HomePage() {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 1);
  to.setHours(0, 0, 0, 0);
  const nodes = await getNodes(from, to);
  return (
    <div className="w-full flex justify-center items-center flex-col">
      <Nodes nodes={nodes} />
    </div>
  );
}
