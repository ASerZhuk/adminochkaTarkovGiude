export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getQuests } from "../../../action/getQuest";
import QuestsClient from "./QuestsClient";

export default async function QuestsPage() {
  const quests = await getQuests();
  return <QuestsClient quests={quests} />;
}
