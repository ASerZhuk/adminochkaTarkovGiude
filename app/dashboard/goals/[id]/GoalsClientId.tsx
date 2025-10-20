"use client";

import { Badge, Button, Divider, Group, Input, Paper, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import type { IGoals } from "../../../../types/goalsTypes";
import { useEffect, useState } from "react";

interface GoalsClientIdProps {
  goals: IGoals[];
  questId: string;
}

export default function GoalsClientId({ goals, questId }: GoalsClientIdProps) {
  const [items, setItems] = useState<IGoals[]>([]);
  const [extraKeys, setExtraKeys] = useState<string[]>([]);
  const [existingValues, setExistingValues] = useState<Record<number, string>>({});
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial = Array.isArray(goals) ? goals : [];
    setItems(initial);
    setExistingValues(Object.fromEntries(initial.map((g) => [g.id, g.name || ""])));
  }, [goals]);

  const addField = () => {
    const key = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setExtraKeys((prev) => [...prev, key]);
    setNewValues((prev) => ({ ...prev, [key]: "" }));
  };

  const extractError = (e: any): string => {
    const data = e?.response?.data;
    const detail = data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail
        .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
        .join("; ");
    if (typeof data === "string") return data;
    if (e?.message) return String(e.message);
    return "Неизвестная ошибка";
  };

  const handleCreate = async (key: string) => {
    const name = (newValues[key] || "").trim();
    if (!name) {
      notifications.show({ color: "red", title: "Ошибка", message: "Введите название цели" });
      return;
    }
    try {
      const resp = await axios.post(`/api/quests/${encodeURIComponent(questId)}/goals`, {
        name,
        qty: 1,
        maps: [],
      });
      notifications.show({ color: "green", title: "Создано", message: "Цель добавлена" });
      // Пытаемся вытащить id созданной цели из ответа
      const data: any = resp?.data;
      const createdId: number | undefined = data?.id ?? data?.goal?.id ?? data?.data?.id;
      if (typeof createdId === "number") {
        setItems((prev) => [...prev, { id: createdId, name, qty: 1, maps: [] }]);
        setExistingValues((prev) => ({ ...prev, [createdId]: name }));
      }
      setExtraKeys((prev) => prev.filter((k) => k !== key));
      setNewValues((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (e: any) {
      notifications.show({ color: "red", title: "Ошибка", message: extractError(e) });
    }
  };

  const handleUpdate = async (goalId: number) => {
    const name = (existingValues[goalId] || "").trim();
    if (!name) {
      notifications.show({ color: "red", title: "Ошибка", message: "Введите название цели" });
      return;
    }
    try {
      await axios.put(`/api/quests/goals/${goalId}`, {
        name,
        qty: 1,
        maps: [],
      });
      notifications.show({ color: "green", title: "Сохранено", message: "Цель обновлена" });
      setItems((prev) => prev.map((g) => (g.id === goalId ? { ...g, name } : g)));
    } catch (e: any) {
      notifications.show({ color: "red", title: "Ошибка", message: extractError(e) });
    }
  };

  const handleDelete = async (goalId: number) => {
    try {
      await axios.delete(`/api/quests/goals/${goalId}`);
      notifications.show({ color: "green", title: "Удалено", message: "Цель удалена" });
      setItems((prev) => prev.filter((g) => g.id !== goalId));
      setExistingValues((prev) => {
        const { [goalId]: _, ...rest } = prev;
        return rest;
      });
    } catch (e: any) {
      notifications.show({ color: "red", title: "Ошибка", message: extractError(e) });
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Редактирование целей квеста</Title>
          </div>
          <Badge variant="light" color="blue">Quest ID: {questId}</Badge>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        {items.map((goal, index) => (
          <Input.Wrapper
            key={`exist-${goal.id}`}
            label={`Название цели №${index + 1}`}
            size="md"
            className="mb-6">
            <Group gap="sm" wrap="nowrap" align="center">
              <Input
                placeholder="Введите название цели"
                value={existingValues[goal.id] ?? ''}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setExistingValues((prev) => ({ ...prev, [goal.id]: v }));
                }}
                style={{ flex: 1 }}
              />
              <Button onClick={() => handleUpdate(goal.id)}>Обновить</Button>
              <Button color="red" onClick={() => handleDelete(goal.id)}>Удалить</Button>
            </Group>
          </Input.Wrapper>
        ))}
      </Paper>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        {extraKeys.map((k, i) => (
          <Input.Wrapper
            key={k}
            label={`Название цели №${(items?.length ?? 0) + i + 1}`}
            size="md"
            className="mb-6">
            <Group gap="sm" wrap="nowrap" align="center">
              <Input
                placeholder="Введите название цели"
                value={newValues[k] ?? ''}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setNewValues((prev) => ({ ...prev, [k]: v }));
                }}
                style={{ flex: 1 }}
              />
              <Button onClick={() => handleCreate(k)}>Сохранить</Button>
              <Button
                color="red"
                onClick={() => {
                  setExtraKeys((prev) => prev.filter((key) => key !== k));
                  setNewValues((prev) => {
                    const { [k]: _, ...rest } = prev;
                    return rest;
                  });
                }}>
                Удалить
              </Button>
            </Group>
          </Input.Wrapper>
        ))}

        <Button onClick={addField}>Добавить цель</Button>
      </Paper>
    </section>
  );
}
