import { getQuests } from "../../../../action/getQuest";
import AwardsUnlocksClient from "./AwardsUnlocksClient";

export default async function AwardsUnlocksPage() {
  const quests = await getQuests();
  return <AwardsUnlocksClient quests={quests} />;
}

