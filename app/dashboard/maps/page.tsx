import { getMaps } from "../../../action/getMaps";
import MapsClient from "./MapsClient";

export default async function MapsPage() {
  const maps = await getMaps();
  return <MapsClient mapsData={maps} />;
}
