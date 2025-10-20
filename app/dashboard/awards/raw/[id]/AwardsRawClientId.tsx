"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { IQuest } from "../../../../../types/questTypes";

interface AwardsRawClientProps {
  quest: IQuest | null;
}

export default function AwardsRawClientId({ quest }: AwardsRawClientProps) {
  const initialText = useMemo(() => {
    const rewardStrings: string[] =
      quest?.award_raw?.data?.reward_strings ?? [];
    return rewardStrings.join("\n");
  }, [quest]);

  const [text, setText] = useState<string>(initialText);
  const [saving, setSaving] = useState<boolean>(false);
  const isDirty = text !== initialText;

  const rewardLines = useMemo(() => {
    return (text || "")
      .split("\n")
      .map((l) => l.replace(/\r$/, ""))
      .filter((l) => l.trim().length > 0);
  }, [text]);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

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

  const handleSave = async () => {
    if (!quest?.id) return;
    setSaving(true);
    try {
      const reward_strings = (text || "")
        .split("\n")
        .map((l) => l.replace(/\r$/, ""))
        .filter((l) => l.trim().length > 0);

      const penalties = quest?.award_raw?.data?.penalties ?? [];
      const item_rewards = quest?.award_raw?.data?.item_rewards ?? [];
      const starting_items = quest?.award_raw?.data?.starting_items ?? [];
      const quest_unlocks = quest?.award_raw?.quest_unlocks ?? [];

      await axios.post(
        `/api/quests/${encodeURIComponent(String(quest.id))}/award_raw`,
        {
          seo_link: quest.seo_link,
          data: {
            reward_strings,
            penalties,
            item_rewards,
            starting_items,
            // По примеру пользователя quest_unlocks ожидается внутри data
            quest_unlocks,
          },
        }
      );
      notifications.show({
        color: "green",
        title: "Сохранено",
        message: "Награды обновлены",
      });
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: extractError(e),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setText(initialText);
  const handleClear = () => setText("");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Награды от трейдеров</Title>
            <Text c="dimmed" size="sm">
              Одна строка — одна награда. Сохраняйте пробелы, если важны.
            </Text>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <div className="lg:col-span-2">
        <Paper withBorder p="md" radius="md">
          <Group mb="sm" justify="space-between" align="end">
            <div>
              <Text fw={600}>Название квеста</Text>
              <Text>{quest?.name ?? "—"}</Text>
            </div>
            <Badge variant="dot" color={isDirty ? "yellow" : "green"}>
              {isDirty ? "Есть несохраненные изменения" : "Без изменений"}
            </Badge>
          </Group>

          <Textarea
            label={`Награды от трейдеров (${rewardLines.length})`}
            placeholder="Введите награды, каждая с новой строки"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            autosize
            minRows={10}
          />

          <Group gap="sm" mt="md">
            <Button
              loading={saving}
              onClick={handleSave}
              disabled={!quest?.id || !isDirty}>
              Сохранить
            </Button>
            <Button variant="light" onClick={handleReset} disabled={!isDirty}>
              Сбросить
            </Button>
            <Button
              variant="default"
              color="gray"
              onClick={handleClear}
              disabled={!text}>
              Очистить
            </Button>
          </Group>
        </Paper>
      </div>

      <div className="lg:col-span-1">
        <Paper withBorder p="md" radius="md">
          <Text fw={600} mb="xs">
            Предпросмотр ({rewardLines.length})
          </Text>
          {rewardLines.length === 0 ? (
            <Text c="dimmed" size="sm">
              Ничего для отображения
            </Text>
          ) : (
            <div className="space-y-2">
              {rewardLines.map((line, idx) => (
                <Paper key={idx} p="xs" radius="sm" withBorder>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {line}
                  </Text>
                </Paper>
              ))}
            </div>
          )}
        </Paper>
      </div>
    </section>
  );
}
