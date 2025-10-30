import AddLayerClient from "./AddLayerClient";
import { getMaps } from "../../../../action/getMaps";

export default async function page() {
  const maps = await getMaps();
  return <AddLayerClient maps={maps} />;
}
