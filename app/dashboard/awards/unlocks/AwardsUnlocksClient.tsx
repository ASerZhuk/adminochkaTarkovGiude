"use client";

import { Input, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import type { IQuest } from "../../../../types/questTypes";
import type { IAwardUnlocks } from "../../../../types/awardUnlocksTypes";

interface AwardsUnlocksClientProps {
  quests: IQuest[];
}

export default function AwardsUnlocksClient({ quests }: AwardsUnlocksClientProps) {
  const [qFilter, setQFilter] = useState("");
  const filtered = useMemo(
    () => (quests ?? []).filter((q) => q.name.toLowerCase().includes(qFilter.toLowerCase())),
    [quests, qFilter]
  );

  const rows = filtered.flatMap((q) => {
    const unlocks: IAwardUnlocks[] = Array.isArray(q.award_unlocks) ? q.award_unlocks : [];
    const rowCount = Math.max(1, unlocks.length);

    const first = (
      <Table.Tr key={`q-${q.id}-row-0`}>
        <Table.Td rowSpan={rowCount}>{q.id}</Table.Td>
        <Table.Td rowSpan={rowCount}>{q.name}</Table.Td>
        {unlocks[0] ? (
          <>
            <Table.Td>{unlocks[0].kind}</Table.Td>
            <Table.Td>{unlocks[0].item_name || unlocks[0].bsg_id}</Table.Td>
            <Table.Td>{unlocks[0]?.extra?.trader_name_tech ?? '-'}</Table.Td>
            <Table.Td>{unlocks[0]?.extra?.loyalty ?? '-'}</Table.Td>
          </>
        ) : (
          <>
            <Table.Td>-</Table.Td>
            <Table.Td>-</Table.Td>
            <Table.Td>-</Table.Td>
            <Table.Td>-</Table.Td>
          </>
        )}
      </Table.Tr>
    );

    const rest: React.ReactNode[] = [];
    for (let i = 1; i < rowCount; i += 1) {
      const u = unlocks[i];
      rest.push(
        <Table.Tr key={`q-${q.id}-row-${i}`}>
          <Table.Td>{u?.kind ?? '-'}</Table.Td>
          <Table.Td>{u ? (u.item_name || u.bsg_id) : '-'}</Table.Td>
          <Table.Td>{u?.extra?.trader_name_tech ?? '-'}</Table.Td>
          <Table.Td>{u?.extra?.loyalty ?? '-'}</Table.Td>
        </Table.Tr>
      );
    }

    return [first, ...rest];
  });

  return (
    <div className="grid gap-4">
      <Input
        placeholder="Поиск по названию квеста"
        value={qFilter}
        onChange={(e) => setQFilter(e.currentTarget.value)}
      />
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID квеста</Table.Th>
            <Table.Th>Название квеста</Table.Th>
            <Table.Th>kind</Table.Th>
            <Table.Th>Название</Table.Th>
            <Table.Th>trader</Table.Th>
            <Table.Th>loyalty</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
