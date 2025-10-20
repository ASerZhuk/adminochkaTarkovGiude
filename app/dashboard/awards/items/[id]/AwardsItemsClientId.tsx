"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Input,
  NumberInput,
  Paper,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { IItem } from "../../../../../types/itemTypes";
import type { IQuest } from "../../../../../types/questTypes";
import type { IAwardItems } from "../../../../../types/awardItemsType";

interface AwardsItemsClientProps {
  quest: IQuest | null;
  items: IItem[] | [];
}

type NewKey = string; // e.g. "new-..."

export default function AwardsItemsClientId({
  quest,
  items,
}: AwardsItemsClientProps) {
  const router = useRouter();
  const [existing, setExisting] = useState<IAwardItems[]>([]);
  const [existingValues, setExistingValues] = useState<
    Record<number, { bsg_id: string | null; count: number }>
  >({});
  const [extraKeys, setExtraKeys] = useState<NewKey[]>([]);
  const [newValues, setNewValues] = useState<
    Record<NewKey, { bsg_id: string | null; count: number }>
  >({});

  const options = useMemo(
    () =>
      (items ?? []).map((it) => ({
        value: it.bsg_id,
        label: it.name_short ? `${it.name_short} — ${it.name}` : it.name,
      })),
    [items]
  );

  useEffect(() => {
    const current = Array.isArray(quest?.award_items) ? quest!.award_items : [];
    setExisting(current);
    setExistingValues(
      Object.fromEntries(
        current.map((ai) => [
          ai.id,
          { bsg_id: ai.bsg_id || null, count: ai.count ?? 1 },
        ])
      )
    );
  }, [quest]);

  const addField = () => {
    const key: NewKey = `new-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    setExtraKeys((prev) => [...prev, key]);
    setNewValues((prev) => ({ ...prev, [key]: { bsg_id: null, count: 1 } }));
  };

  const extractError = (e: any): string => {
    const data = e?.response?.data;
    const detail = data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail
        .map((d: any) =>
          typeof d === "string" ? d : d?.msg || JSON.stringify(d)
        )
        .join("; ");
    if (typeof data === "string") return data;
    if (e?.message) return String(e.message);
    return "Неизвестная ошибка";
  };

  const handleCreate = async (key: NewKey) => {
    if (!quest?.id) return;
    const val = newValues[key];
    const bsg_id = val?.bsg_id || "";
    const count = Number(val?.count || 0);
    if (!bsg_id) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Выберите предмет",
      });
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Введите количество больше 0",
      });
      return;
    }

    try {
      const resp = await axios.post(
        `/api/quests/${encodeURIComponent(String(quest.id))}/award_items`,
        {
          bsg_id,
          count,
          seo_link: quest.seo_link,
        }
      );
      notifications.show({
        color: "green",
        title: "Создано",
        message: "Награда добавлена",
      });

      const data: any = resp?.data;
      // Try refresh to ensure consistency
      router.refresh();

      // Optimistic update if possible
      const createdId: number | undefined =
        data?.id ?? data?.item?.id ?? data?.data?.id;
      if (typeof createdId === "number") {
        setExisting((prev) => [
          ...prev,
          {
            id: createdId,
            bsg_id,
            item_name: options.find((o) => o.value === bsg_id)?.label || bsg_id,
            count,
          } as IAwardItems,
        ]);
        setExistingValues((prev) => ({
          ...prev,
          [createdId]: { bsg_id, count },
        }));
      }

      setExtraKeys((prev) => prev.filter((k) => k !== key));
      setNewValues((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: extractError(e),
      });
    }
  };

  const handleUpdate = async (awardItemId: number) => {
    const v = existingValues[awardItemId];
    const bsg_id = v?.bsg_id || "";
    const count = Number(v?.count || 0);
    if (!bsg_id) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Выберите предмет",
      });
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Введите количество больше 0",
      });
      return;
    }
    try {
      await axios.put(`/api/quests/award_items/${awardItemId}`, {
        bsg_id,
        count,
      });
      notifications.show({
        color: "green",
        title: "Сохранено",
        message: "Награда обновлена",
      });
      setExisting((prev) =>
        prev.map((ai) =>
          ai.id === awardItemId
            ? {
                ...ai,
                bsg_id,
                item_name:
                  options.find((o) => o.value === bsg_id)?.label ||
                  ai.item_name,
                count,
              }
            : ai
        )
      );
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: extractError(e),
      });
    }
  };

  const handleDelete = async (awardItemId: number) => {
    try {
      await axios.delete(`/api/quests/award_items/${awardItemId}`);
      notifications.show({
        color: "green",
        title: "Удалено",
        message: "Награда удалена",
      });
      setExisting((prev) => prev.filter((ai) => ai.id !== awardItemId));
      setExistingValues((prev) => {
        const { [awardItemId]: _, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      });
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: extractError(e),
      });
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Награды (Предметы)</Title>
            <Text c="dimmed" size="sm">
              Выберите предмет и количество, затем сохраните.
            </Text>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-2">
        <Text fw={600} mb="sm">
          Существующие награды
        </Text>
        {existing.length === 0 ? (
          <Text c="dimmed" size="sm">
            Нет наград
          </Text>
        ) : (
          <div className="space-y-4">
            {existing.map((ai, idx) => (
              <Group key={`exist-${ai.id}`} gap="sm" wrap="wrap" align="end">
                <Input.Wrapper label={`Награда №${idx + 1}`} className="grow">
                  <Select
                    searchable
                    data={options}
                    placeholder="Выберите предмет"
                    value={existingValues[ai.id]?.bsg_id || null}
                    onChange={(val) =>
                      setExistingValues((prev) => ({
                        ...prev,
                        [ai.id]: {
                          bsg_id: val,
                          count: prev[ai.id]?.count ?? 1,
                        },
                      }))
                    }
                  />
                </Input.Wrapper>
                <NumberInput
                  label="Количество"
                  min={1}
                  value={existingValues[ai.id]?.count ?? 1}
                  onChange={(val: any) =>
                    setExistingValues((prev) => ({
                      ...prev,
                      [ai.id]: {
                        bsg_id: prev[ai.id]?.bsg_id ?? null,
                        count: Number(val) || 1,
                      },
                    }))
                  }
                />
                <Button onClick={() => handleUpdate(ai.id)}>Обновить</Button>
                <Button color="red" onClick={() => handleDelete(ai.id)}>
                  Удалить
                </Button>
              </Group>
            ))}
          </div>
        )}
      </Paper>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Text fw={600} mb="sm">
          Добавить награду
        </Text>
        {extraKeys.map((k, i) => (
          <Group key={k} gap="sm" wrap="wrap" align="end" className="mb-3">
            <Input.Wrapper
              label={`Награда №${(existing?.length ?? 0) + i + 1}`}
              className="grow">
              <Select
                searchable
                data={options}
                placeholder="Выберите предмет"
                value={newValues[k]?.bsg_id || null}
                onChange={(val) =>
                  setNewValues((prev) => ({
                    ...prev,
                    [k]: { bsg_id: val, count: prev[k]?.count ?? 1 },
                  }))
                }
              />
            </Input.Wrapper>
            <NumberInput
              label="Количество"
              min={1}
              value={newValues[k]?.count ?? 1}
              onChange={(val: any) =>
                setNewValues((prev) => ({
                  ...prev,
                  [k]: {
                    bsg_id: prev[k]?.bsg_id ?? null,
                    count: Number(val) || 1,
                  },
                }))
              }
            />
            <Button onClick={() => handleCreate(k)}>Сохранить</Button>
            <Button
              color="red"
              onClick={() => {
                setExtraKeys((prev) => prev.filter((x) => x !== k));
                setNewValues((prev) => {
                  const { [k]: _, ...rest } = prev;
                  return rest;
                });
              }}>
              Удалить
            </Button>
          </Group>
        ))}

        <Button onClick={addField}>Добавить предмет</Button>
      </Paper>
    </section>
  );
}
