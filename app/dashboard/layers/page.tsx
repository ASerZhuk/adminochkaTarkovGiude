import { getMaps } from "../../../action/getMaps";
import LayersClient from "./LayersClient";

export default async function page() {
  const maps = await getMaps();
  return <LayersClient mapsData={maps} />;
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
