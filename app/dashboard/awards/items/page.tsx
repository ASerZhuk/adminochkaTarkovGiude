import { getQuests } from "../../../../action/getQuest";
import AwardsItemsClient from "./AwardsItemsClient";

export default async function AwardsItemsPage() {
  const quests = await getQuests();
  return <AwardsItemsClient quests={quests} />;
}

