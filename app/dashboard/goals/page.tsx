import { getQuests } from "../../../action/getQuest";
import GoalsClient from "./GoalsClient";

export default async function GoalsPage() {
  const quests = await getQuests();
  return <GoalsClient quests={quests} />;
}
