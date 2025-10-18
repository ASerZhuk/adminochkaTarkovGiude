"use client";

import { Table } from "@mantine/core";
import { IQuest } from "../../../types/questTypes";
import type { IAwardItems } from "../../../types/awardItemsType";
import type { IAwardUnlocks } from "../../../types/awardUnlocksTypes";

interface AwardsClientProps {
  quests: IQuest[] | [];
}

export default function AwardsClient({ quests }: AwardsClientProps) {
  const rows = (quests ?? []).flatMap((q) => {
    const items: IAwardItems[] = Array.isArray(q.award_items) ? q.award_items : [];
    const unlocks: IAwardUnlocks[] = Array.isArray(q.award_unlocks) ? q.award_unlocks : [];
    const rowCount = Math.max(1, items.length, unlocks.length);

    const rewardStrings: string[] = q?.award_raw?.data?.reward_strings ?? [];
    const awardRawCell = (
      <Table.Td rowSpan={rowCount} style={{ whiteSpace: "pre-wrap" }}>
        {rewardStrings.length > 0 ? rewardStrings.join("\n") : "-"}
      </Table.Td>
    );

    const makeItemCell = (i: number) => {
      const it = items[i];
      if (!it) return <Table.Td>-</Table.Td>;
      const count = it.count ?? "-";
      return <Table.Td>{`${it.bsg_id} x${count}`}</Table.Td>;
    };

    const makeUnlockCell = (i: number) => {
      const u = unlocks[i];
      if (!u) return <Table.Td>-</Table.Td>;
      const extras = u?.extra ? ` ${u.extra.trader_name_tech} L${u.extra.loyalty}` : "";
      return <Table.Td>{`${u.kind}${extras} — ${u.bsg_id}`}</Table.Td>;
    };

    const firstRow = (
      <Table.Tr key={`q-${q.id}-row-0`}>
        <Table.Td rowSpan={rowCount}>{q.id}</Table.Td>
        {awardRawCell}
        {makeItemCell(0)}
        {makeUnlockCell(0)}
      </Table.Tr>
    );

    const rest: React.ReactNode[] = [];
    for (let i = 1; i < rowCount; i += 1) {
      rest.push(
        <Table.Tr key={`q-${q.id}-row-${i}`}>
          {makeItemCell(i)}
          {makeUnlockCell(i)}
        </Table.Tr>
      );
    }

    return [firstRow, ...rest];
  });

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID квеста</Table.Th>
          <Table.Th>Awards Raw</Table.Th>
          <Table.Th>Award Items</Table.Th>
          <Table.Th>Award Unlocks</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
