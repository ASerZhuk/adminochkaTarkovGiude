"use client";

import { Input, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import type { IQuest } from "../../../../types/questTypes";
import type { IAwardItems } from "../../../../types/awardItemsType";

interface AwardsItemsClientProps {
  quests: IQuest[];
}

export default function AwardsItemsClient({ quests }: AwardsItemsClientProps) {
  const [qFilter, setQFilter] = useState("");
  const filtered = useMemo(
    () => (quests ?? []).filter((q) => q.name.toLowerCase().includes(qFilter.toLowerCase())),
    [quests, qFilter]
  );

  const rows = filtered.flatMap((q) => {
    const items: IAwardItems[] = Array.isArray(q.award_items)
      ? q.award_items
      : [];
    const rowCount = Math.max(1, items.length);

    const first = (
      <Table.Tr key={`q-${q.id}-row-0`}>
        <Table.Td rowSpan={rowCount}>{q.id}</Table.Td>
        <Table.Td rowSpan={rowCount}>{q.name}</Table.Td>
        {items[0] ? (
          <>
            <Table.Td>{items[0].item_name}</Table.Td>
            <Table.Td>{items[0].count ?? "-"}</Table.Td>
          </>
        ) : (
          <>
            <Table.Td>-</Table.Td>
            <Table.Td>-</Table.Td>
          </>
        )}
      </Table.Tr>
    );

    const rest: React.ReactNode[] = [];
    for (let i = 1; i < rowCount; i += 1) {
      const it = items[i];
      rest.push(
        <Table.Tr key={`q-${q.id}-row-${i}`}>
          <Table.Td>{it ? it.item_name : "-"}</Table.Td>
          <Table.Td>{it?.count ?? "-"}</Table.Td>
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
            <Table.Th>Название предмета</Table.Th>
            <Table.Th>Количество</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
