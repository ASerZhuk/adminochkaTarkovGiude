"use client";

import { Input, Table } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import type { IQuest } from "../../../types/questTypes";

interface QuestsClientProps {
  quests: IQuest[];
}

export default function GoalsClient({ quests }: QuestsClientProps) {
  const router = useRouter();
  const [qFilter, setQFilter] = useState("");
  const filtered = useMemo(
    () => (quests ?? []).filter((q) => q.name.toLowerCase().includes(qFilter.toLowerCase())),
    [quests, qFilter]
  );

  const rows = filtered.flatMap((quest) => {
    const goals = quest.goals ?? [];
    const count = goals.length;

    // Если у квеста нет целей — одна строка с тире
    if (count === 0) {
      const href = `/dashboard/goals/${quest.id}`;
      const onRowClick = () => router.push(href);
      const onRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      };

      return (
        <Table.Tr
          key={`q-${quest.id}-empty`}
          onClick={onRowClick}
          onKeyDown={onRowKeyDown}
          role="link"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          data-href={href}>
          <Table.Td>{quest.id}</Table.Td>
          <Table.Td>{quest.name}</Table.Td>
          <Table.Td>-</Table.Td>
        </Table.Tr>
      );
    }

    // Первая строка: квест с rowSpan + первая цель
    const first = goals[0];
    const firstHref = `/dashboard/goals/${quest.id}`;
    const onFirstClick = () => router.push(firstHref);
    const onFirstKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(firstHref);
      }
    };

    const rowsForQuest: ReactNode[] = [
      <Table.Tr
        key={`q-${quest.id}-g-${first.id}`}
        onClick={onFirstClick}
        onKeyDown={onFirstKeyDown}
        role="link"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        data-href={firstHref}>
        <Table.Td rowSpan={count}>{quest.id}</Table.Td>
        <Table.Td rowSpan={count}>{quest.name}</Table.Td>
        <Table.Td>{first.name}</Table.Td>
      </Table.Tr>,
    ];

    // Остальные цели: одна ячейка в строке
    for (let i = 1; i < count; i++) {
      const goal = goals[i];
      const href = `/dashboard/goals/${quest.id}`;
      const onRowClick = () => router.push(href);
      const onRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      };

      rowsForQuest.push(
        <Table.Tr
          key={`q-${quest.id}-g-${goal.id}`}
          onClick={onRowClick}
          onKeyDown={onRowKeyDown}
          role="link"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          data-href={href}>
          <Table.Td>{goal.name}</Table.Td>
        </Table.Tr>
      );
    }

    return rowsForQuest;
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
            <Table.Th>ID</Table.Th>
            <Table.Th>Название квеста</Table.Th>
            <Table.Th>Цели</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
