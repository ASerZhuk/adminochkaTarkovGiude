import { getMaps } from "../../../action/getMaps";
import MarkersClient from "./MarkersClient";

export default async function MarkersPage() {
  const maps = await getMaps();
  return <MarkersClient mapsData={maps} />;
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
