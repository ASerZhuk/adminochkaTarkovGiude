import { getQuests } from "../../../../action/getQuest";
import AwardsRawClient from "./AwardsRawClient";

export default async function AwardsRawPage() {
  const quests = await getQuests();
  return <AwardsRawClient quests={quests} />;
}

