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
import type { IItem } from "../../../../../types/itemTypes";
import type { IQuest } from "../../../../../types/questTypes";
import type { IAwardUnlocks } from "../../../../../types/awardUnlocksTypes";
import type { ITrader } from "../../../../../types/traderTypes";

interface AwardsUnlocksClientIdProps {
  quest: IQuest | null;
  items: IItem[] | [];
  traders: ITrader[] | [];
}

type NewKey = string;

type UnlockForm = {
  kind: string;
  bsg_id: string | null;
  loyalty?: number | null;
  barter_items_count?: number | null;
  trader_name_tech?: string | null;
};

export default function AwardsUnlocksClientId({
  quest,
  items,
  traders,
}: AwardsUnlocksClientIdProps) {
  const [existing, setExisting] = useState<IAwardUnlocks[]>([]);
  const [existingValues, setExistingValues] = useState<
    Record<number, UnlockForm>
  >({});
  const [extraKeys, setExtraKeys] = useState<NewKey[]>([]);
  const [newValues, setNewValues] = useState<Record<NewKey, UnlockForm>>({});

  const itemOptions = useMemo(
    () =>
      (items ?? []).map((it) => ({
        value: it.bsg_id,
        label: it.name_short ? `${it.name_short} — ${it.name}` : it.name,
      })),
    [items]
  );
  const traderOptions = useMemo(
    () =>
      (traders ?? []).map((t) => ({ value: t.seo_link, label: t.seo_link })),
    [traders]
  );
  const kindOptions = useMemo(
    () => [
      { value: "ware", label: "ware" },
      { value: "craft", label: "craft" },
    ],
    []
  );

  useEffect(() => {
    const current = Array.isArray(quest?.award_unlocks)
      ? quest!.award_unlocks
      : [];
    setExisting(current);
    setExistingValues(
      Object.fromEntries(
        current.map((u) => {
          const traderSeoFromUnlock = (traders ?? []).find(
            (t) => t.name_tech === u?.extra?.trader_name_tech
          )?.seo_link;
          const traderSeo =
            traderSeoFromUnlock || quest?.trader?.seo_link || null;
          return [
            u.id,
            {
              kind: u.kind || "",
              bsg_id: u.bsg_id || null,
              loyalty: u?.extra?.loyalty ?? null,
              barter_items_count: u?.extra?.barter_items_count ?? null,
              trader_seo_link: traderSeo,
            },
          ];
        })
      )
    );
  }, [quest, traders]);

  const addField = () => {
    const key: NewKey = `new-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    setExtraKeys((prev) => [...prev, key]);
    setNewValues((prev) => ({
      ...prev,
      [key]: {
        kind: "",
        bsg_id: null,
        loyalty: null,
        barter_items_count: null,
        trader_seo_link: quest?.trader?.seo_link ?? null,
      },
    }));
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

  const toBody = (v: any) => {
    const extra: any = {};
    if (v.loyalty != null && v.loyalty !== undefined && `${v.loyalty}` !== "")
      extra.loyalty = Number(v.loyalty);
    if (
      v.barter_items_count != null &&
      v.barter_items_count !== undefined &&
      `${v.barter_items_count}` !== ""
    )
      extra.barter_items_count = Number(v.barter_items_count);
    if (v.trader_seo_link) extra.trader_seo_link = v.trader_seo_link;
    const body: any = { kind: v.kind, extra };
    if (v.bsg_id) body.bsg_id = v.bsg_id;
    return body;
  };

  const handleCreate = async (key: NewKey) => {
    if (!quest?.id) return;
    const v = newValues[key] || { kind: "", bsg_id: null };
    if (!v.kind.trim()) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Укажите kind",
      });
      return;
    }
    try {
      await axios.post(
        `/api/quests/${encodeURIComponent(String(quest.id))}/award_unlocks`,
        toBody(v)
      );
      notifications.show({
        color: "green",
        title: "Создано",
        message: "Разблокировка добавлена",
      });
      // Refresh UI
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

  const handleUpdate = async (unlockId: number) => {
    const v = existingValues[unlockId];
    if (!v?.kind?.trim()) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Укажите kind",
      });
      return;
    }
    try {
      await axios.put(`/api/quests/award_unlocks/${unlockId}`, toBody(v));
      notifications.show({
        color: "green",
        title: "Сохранено",
        message: "Разблокировка обновлена",
      });
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: extractError(e),
      });
    }
  };

  const handleDelete = async (unlockId: number) => {
    try {
      await axios.delete(`/api/quests/award_unlocks/${unlockId}`);
      notifications.show({
        color: "green",
        title: "Удалено",
        message: "Разблокировка удалена",
      });
      setExisting((prev) => prev.filter((u) => u.id !== unlockId));
      setExistingValues((prev) => {
        const { [unlockId]: _, ...rest } = prev;
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
            <Title order={3}>Редактирование разблокировки</Title>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-2">
        <Text fw={600} mb="sm">
          Существующие разблокировки
        </Text>
        {existing.length === 0 ? (
          <Text c="dimmed" size="sm">
            Нет разблокировок
          </Text>
        ) : (
          <div className="space-y-4">
            {existing.map((u, idx) => (
              <Group key={`exist-${u.id}`} gap="sm" wrap="wrap" align="end">
                <Input.Wrapper
                  label={`Разблокировка №${idx + 1}`}
                  className="grow">
                  <Select
                    searchable
                    data={kindOptions}
                    placeholder="Выберите kind"
                    value={existingValues[u.id]?.kind || null}
                    onChange={(val) =>
                      setExistingValues((prev) => ({
                        ...prev,
                        [u.id]: {
                          ...(prev[u.id] || { kind: "" }),
                          kind: val || "",
                        },
                      }))
                    }
                  />
                </Input.Wrapper>
                <Input.Wrapper label="Предмет" className="grow">
                  <Select
                    searchable
                    data={itemOptions}
                    placeholder="Опционально: выберите предмет"
                    value={existingValues[u.id]?.bsg_id || null}
                    onChange={(val) =>
                      setExistingValues((prev) => ({
                        ...prev,
                        [u.id]: {
                          ...(prev[u.id] || { kind: "" }),
                          bsg_id: val,
                        },
                      }))
                    }
                  />
                </Input.Wrapper>
                <NumberInput
                  label="Уровень лояльности"
                  min={0}
                  value={existingValues[u.id]?.loyalty ?? undefined}
                  onChange={(val: any) =>
                    setExistingValues((prev) => ({
                      ...prev,
                      [u.id]: {
                        ...(prev[u.id] || { kind: "" }),
                        loyalty: Number(val),
                      },
                    }))
                  }
                />
                <NumberInput
                  label="Количество предметов"
                  min={0}
                  value={existingValues[u.id]?.barter_items_count ?? undefined}
                  onChange={(val: any) =>
                    setExistingValues((prev) => ({
                      ...prev,
                      [u.id]: {
                        ...(prev[u.id] || { kind: "" }),
                        barter_items_count: Number(val),
                      },
                    }))
                  }
                />
                <Input.Wrapper label="Трейдер">
                  <Select
                    searchable
                    data={traderOptions}
                    placeholder="Выберите трейдера"
                    value={
                      (existingValues[u.id] as any)?.trader_seo_link || null
                    }
                    onChange={(val) =>
                      setExistingValues((prev) => ({
                        ...prev,
                        [u.id]: {
                          ...((prev[u.id] as any) || {}),
                          trader_seo_link: val || null,
                        },
                      }))
                    }
                  />
                </Input.Wrapper>
                <Button onClick={() => handleUpdate(u.id)}>Обновить</Button>
                <Button color="red" onClick={() => handleDelete(u.id)}>
                  Удалить
                </Button>
              </Group>
            ))}
          </div>
        )}
      </Paper>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Text fw={600} mb="sm">
          Добавить разблокировку
        </Text>
        {extraKeys.map((k, i) => (
          <Group key={k} gap="sm" wrap="wrap" align="end" className="mb-3">
            <Input.Wrapper
              label={`Разблокировка №${(existing?.length ?? 0) + i + 1}`}
              className="grow">
              <Select
                searchable
                data={kindOptions}
                placeholder="Выберите kind"
                value={newValues[k]?.kind || null}
                onChange={(val) =>
                  setNewValues((prev) => ({
                    ...prev,
                    [k]: { ...(prev[k] || { kind: "" }), kind: val || "" },
                  }))
                }
              />
            </Input.Wrapper>
            <Input.Wrapper label="Предмет" className="grow">
              <Select
                searchable
                data={itemOptions}
                placeholder="Опционально: выберите предмет"
                value={newValues[k]?.bsg_id || null}
                onChange={(val) =>
                  setNewValues((prev) => ({
                    ...prev,
                    [k]: { ...(prev[k] || { kind: "" }), bsg_id: val },
                  }))
                }
              />
            </Input.Wrapper>
            <NumberInput
              label="Уровень лояльности"
              min={0}
              value={newValues[k]?.loyalty ?? undefined}
              onChange={(val: any) =>
                setNewValues((prev) => ({
                  ...prev,
                  [k]: { ...(prev[k] || { kind: "" }), loyalty: Number(val) },
                }))
              }
            />
            <NumberInput
              label="Количество предметов"
              min={0}
              value={newValues[k]?.barter_items_count ?? undefined}
              onChange={(val: any) =>
                setNewValues((prev) => ({
                  ...prev,
                  [k]: {
                    ...(prev[k] || { kind: "" }),
                    barter_items_count: Number(val),
                  },
                }))
              }
            />
            <Input.Wrapper label="Трейдер">
              <Select
                searchable
                data={traderOptions}
                placeholder="Выберите трейдера"
                value={(newValues[k] as any)?.trader_seo_link || null}
                onChange={(val) =>
                  setNewValues((prev) => ({
                    ...prev,
                    [k]: {
                      ...((prev[k] as any) || {}),
                      trader_seo_link: val || null,
                    },
                  }))
                }
              />
            </Input.Wrapper>
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

        <Button onClick={addField}>Добавить разблокировку</Button>
      </Paper>
    </section>
  );
}
