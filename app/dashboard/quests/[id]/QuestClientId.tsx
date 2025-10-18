"use client";

import {
  Button,
  Input,
  MultiSelect,
  NativeSelect,
  NumberInput,
  Select,
  Textarea,
  Group,
} from "@mantine/core";
import { IQuest } from "../../../../types/questTypes";
import { ITrader } from "../../../../types/traderTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import {
  upsertNextLink,
  upsertParentLink,
  deleteParentLink,
  deleteNextLink,
} from "./updateQuestLinks";
import { IMaps } from "../../../../types/mapsTypes";

interface QuestClientIdProps {
  quest: IQuest | null;
  traders: ITrader[];
  quests: IQuest[] | [];
  maps: IMaps[] | [];
}

export default function QuestClientId({
  quest,
  traders,
  quests,
  maps,
}: QuestClientIdProps) {
  const router = useRouter();
  const guidesRef = useRef<HTMLTextAreaElement | null>(null);
  const baseOptions = traders.map((t) => ({
    value: t.name_tech,
    label: t.name_tech,
  }));

  const current = quest?.trader?.name_tech;
  const hasCurrent = current
    ? baseOptions.some((o) => o.value === current)
    : false;
  const traderOptions =
    hasCurrent || !current
      ? baseOptions
      : [{ value: current, label: current }, ...baseOptions];

  const questOptions = (quests ?? [])
    .filter(
      (q) => typeof q.seo_link === "string" && q.seo_link.trim().length > 0
    )
    .map((q) => ({
      value: q.seo_link,
      label: q.name,
    }));
  const questValuesSet = new Set(questOptions.map((o) => o.value));
  const currentParentOptions = (quest?.parent_quests ?? [])
    .filter((p) => !questValuesSet.has(p.seo_link))
    .map((p) => ({ value: p.seo_link, label: p.name }));
  const currentNextOptions = (quest?.next_quests ?? [])
    .filter((p) => !questValuesSet.has(p.seo_link))
    .map((p) => ({ value: p.seo_link, label: p.name }));
  const allQuestOptions = [
    ...questOptions,
    ...currentParentOptions,
    ...currentNextOptions,
  ];

  const mapOptions = (maps ?? []).map((m) => ({
    value: m.seo_link,
    label: m.name,
  }));
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: quest?.name ?? "",
      seo_link: quest?.seo_link ?? "",
      guides: quest?.guides ?? "",
      level_req: (quest?.level_req as number | undefined) ?? undefined,
      is_unlocked_over_time: Boolean(quest?.is_unlocked_over_time),
      kappa_req: Boolean(quest?.kappa_req),
      trader_name_tech:
        (quest?.trader?.name_tech as string | undefined) ?? undefined,
      parent_quests_seo: (quest?.parent_quests ?? []).map((p) => p.seo_link),
      next_quests_seo: (quest?.next_quests ?? []).map((p) => p.seo_link),
    },
  });
  const [saving, setSaving] = useState(false);
  const [parentLinkIds, setParentLinkIds] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        (quest?.parent_quests ?? [])
          .map((p: any) => [p.seo_link, p.id])
          .filter(([, id]) => typeof id === "number")
      )
  );
  const [nextLinkIds, setNextLinkIds] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (quest?.next_quests ?? [])
        .map((p: any) => [p.seo_link, p.id])
        .filter(([, id]) => typeof id === "number")
    )
  );
  const [linksChanged, setLinksChanged] = useState(false);

  useEffect(() => {
    form.setValues({
      name: quest?.name ?? "",
      seo_link: quest?.seo_link ?? "",
      guides: quest?.guides ?? "",
      level_req: (quest?.level_req as number | undefined) ?? undefined,
      is_unlocked_over_time: Boolean(quest?.is_unlocked_over_time),
      kappa_req: Boolean(quest?.kappa_req),
      trader_name_tech:
        (quest?.trader?.name_tech as string | undefined) ?? undefined,
      parent_quests_seo: (quest?.parent_quests ?? []).map((p) => p.seo_link),
      next_quests_seo: (quest?.next_quests ?? []).map((p) => p.seo_link),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest]);

  useEffect(() => {
    setParentLinkIds(
      Object.fromEntries(
        (quest?.parent_quests ?? [])
          .map((p: any) => [p.seo_link, p.id])
          .filter(([, id]) => typeof id === "number")
      )
    );
    setNextLinkIds(
      Object.fromEntries(
        (quest?.next_quests ?? [])
          .map((p: any) => [p.seo_link, p.id])
          .filter(([, id]) => typeof id === "number")
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest]);

  useEffect(() => {
    if (linksChanged) {
      router.refresh();
      setLinksChanged(false);
    }
  }, [linksChanged, router]);

  const slugify = (s: string) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-_.~А-Яа-яЁё]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!quest) return;

    if (!form.values.name) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Заполните название квеста",
      });
      return;
    }
    if (!form.values.seo_link) {
      const generated = slugify(form.values.name);
      form.setFieldValue("seo_link", generated);
    }

    setSaving(true);
    try {
      const selectedTrader = traders.find(
        (t) => t.name_tech === form.values.trader_name_tech
      );
      const trader_id = selectedTrader?.id ?? quest.trader_id;

      const payload: any = {
        name: form.values.name,
        seo_link: form.values.seo_link,
        guides: form.values.guides ?? "",
        level_req:
          typeof form.values.level_req === "number"
            ? form.values.level_req
            : undefined,
        is_unlocked_over_time: Boolean(form.values.is_unlocked_over_time),
        kappa_req: Boolean(form.values.kappa_req),
        ...(trader_id ? { trader_id } : {}),
      };

      await axios.put(`/api/quests/${quest.id}`, payload);

      notifications.show({
        color: "green",
        title: "Сохранено",
        message: "Квест и связи обновлены",
      });
      router.push("/dashboard/quests");
      router.refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const err: any = e as any;
      let message = "Ошибка сохранения";
      const data = err?.response?.data;
      const detail = data?.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((d: any) =>
            typeof d === "string" ? d : d?.msg || JSON.stringify(d)
          )
          .join("; ");
      } else if (typeof data === "string") {
        message = data;
      } else if (err?.message) {
        message = String(err.message);
      }
      notifications.show({
        color: "red",
        title: "Ошибка",
        message,
      });
    } finally {
      setSaving(false);
    }
  };

  const insertMapTag = () => {
    if (!selectedMap) return;
    const token = `[map=${selectedMap}]`;
    const current = form.values.guides || "";
    const ta = guidesRef.current;
    if (
      ta &&
      typeof ta.selectionStart === "number" &&
      typeof ta.selectionEnd === "number"
    ) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = current.slice(0, start) + token + current.slice(end);
      form.setFieldValue("guides", next);
      requestAnimationFrame(() => {
        if (guidesRef.current) {
          const pos = start + token.length;
          guidesRef.current.selectionStart = pos;
          guidesRef.current.selectionEnd = pos;
          guidesRef.current.focus();
        }
      });
    } else {
      form.setFieldValue("guides", current + token);
    }
    setSelectedMap(null);
  };
  return (
    <section className="grid grid-cols-2 gap-6">
      <div className="col-span-1">
        <Input.Wrapper
          label="Название квеста"
          withAsterisk
          size="md"
          className="mb-8">
          <Input
            placeholder="Введите название квеста"
            value={form.values.name}
            onChange={(e) => {
              const v = e.currentTarget.value;
              form.setFieldValue("name", v);
            }}
          />
        </Input.Wrapper>
        <Input.Wrapper
          label="Название квеста для seo"
          withAsterisk
          size="md"
          className="mb-8">
          <Input
            placeholder="Введите название квеста для seo"
            value={form.values.seo_link}
            onChange={(e) => {
              const v = e.currentTarget.value;
              form.setFieldValue("seo_link", v);
            }}
          />
        </Input.Wrapper>
        <Group align="end" gap="sm" className="mb-2">
          <Select
            size="md"
            label="Выбор карты"
            placeholder="Начните вводить название карты"
            searchable
            data={mapOptions}
            value={selectedMap}
            onChange={(v) => setSelectedMap(v)}
            className="grow"
          />
          <Button
            size="md"
            variant="light"
            onClick={insertMapTag}
            disabled={!selectedMap}>
            Вставить
          </Button>
        </Group>
        <Textarea
          size="md"
          label="Прохождение квеста"
          placeholder="Заполните прохождение квеста"
          value={form.values.guides}
          onChange={(e) => {
            const v = e.currentTarget.value;
            form.setFieldValue("guides", v);
          }}
          ref={guidesRef}
          autosize
        />
      </div>
      <div className="col-span-1">
        <NumberInput
          value={form.values.level_req}
          size="md"
          label="Требуемый уровень"
          placeholder="Введите требуемый уровень"
          onChange={(val: any) => {
            const n = typeof val === "number" ? val : Number(val);
            form.setFieldValue("level_req", Number.isNaN(n) ? undefined : n);
          }}
          className="mb-8"
        />
        <NativeSelect
          size="md"
          label="Возобновляемый квест?"
          value={form.values.is_unlocked_over_time ? "Да" : "Нет"}
          data={["Да", "Нет"]}
          onChange={(e) => {
            const v = e.currentTarget.value;
            form.setFieldValue("is_unlocked_over_time", v === "Да");
          }}
          className="mb-8"
        />
        <NativeSelect
          size="md"
          label="Для Каппы?"
          value={form.values.kappa_req ? "Да" : "Нет"}
          data={["Да", "Нет"]}
          onChange={(e) => {
            const v = e.currentTarget.value;
            form.setFieldValue("kappa_req", v === "Да");
          }}
          className="mb-8"
        />
        <NativeSelect
          size="md"
          label="Выберите трейдера"
          value={form.values.trader_name_tech}
          data={traderOptions}
          onChange={(e) => {
            const v = e.currentTarget.value;
            form.setFieldValue("trader_name_tech", v);
          }}
        />
        <MultiSelect
          size="md"
          label="Предыдущий квест"
          searchable
          data={allQuestOptions}
          value={form.values.parent_quests_seo}
          onChange={async (vals) => {
            const prev = form.values.parent_quests_seo ?? [];
            const added = vals.filter((v) => !prev.includes(v));
            const removed = prev.filter((v) => !vals.includes(v));

            if (quest && added.length > 0) {
              const s = added[0];
              const opt = (allQuestOptions || []).find((o) => o.value === s);
              const name = opt?.label || s;
              const res = await upsertParentLink(quest.id, name, s);
              if (res.ok) {
                if (typeof res.id === "number") {
                  setParentLinkIds((map) => ({
                    ...map,
                    [s]: res.id as number,
                  }));
                }
                form.setFieldValue("parent_quests_seo", vals);
                setLinksChanged(true);
              } else {
                form.setFieldValue("parent_quests_seo", prev);
              }
              return;
            }

            if (removed.length > 0) {
              const s = removed[0];
              const linkId = parentLinkIds[s];
              if (typeof linkId !== "number") {
                form.setFieldValue("parent_quests_seo", prev);
                return;
              }
              const ok = await deleteParentLink(linkId);
              if (ok) {
                setParentLinkIds((map) => {
                  const { [s]: _, ...rest } = map;
                  return rest;
                });
                form.setFieldValue("parent_quests_seo", vals);
                setLinksChanged(true);
              } else {
                form.setFieldValue("parent_quests_seo", prev);
              }
              return;
            }

            form.setFieldValue("parent_quests_seo", vals);
          }}
          placeholder="Выберите предыдущие квесты"
          className="mt-8"
        />
        <MultiSelect
          size="md"
          label="Следующий квест"
          searchable
          data={allQuestOptions}
          value={form.values.next_quests_seo}
          onChange={async (vals) => {
            const prev = form.values.next_quests_seo ?? [];
            const added = vals.filter((v) => !prev.includes(v));
            const removed = prev.filter((v) => !vals.includes(v));

            if (quest && added.length > 0) {
              const s = added[0];
              const opt = (allQuestOptions || []).find((o) => o.value === s);
              const name = opt?.label || s;
              const res = await upsertNextLink(quest.id, name, s);
              if (res.ok) {
                if (typeof res.id === "number") {
                  setNextLinkIds((map) => ({ ...map, [s]: res.id as number }));
                }
                form.setFieldValue("next_quests_seo", vals);
                setLinksChanged(true);
              } else {
                form.setFieldValue("next_quests_seo", prev);
              }
              return;
            }

            if (removed.length > 0) {
              const s = removed[0];
              const linkId = nextLinkIds[s];
              if (typeof linkId !== "number") {
                form.setFieldValue("next_quests_seo", prev);
                return;
              }
              const ok = await deleteNextLink(linkId);
              if (ok) {
                setNextLinkIds((map) => {
                  const { [s]: _, ...rest } = map;
                  return rest;
                });
                form.setFieldValue("next_quests_seo", vals);
                setLinksChanged(true);
              } else {
                form.setFieldValue("next_quests_seo", prev);
              }
              return;
            }

            form.setFieldValue("next_quests_seo", vals);
          }}
          placeholder="Выберите следующие квесты"
          className="mt-8"
        />
      </div>
      <div className="col-span-2">
        <Button
          variant="filled"
          size="md"
          className="mr-4"
          loading={saving}
          onClick={handleSave}>
          Сохранить
        </Button>
        <Button variant="filled" size="md" color="red" disabled>
          Удалить
        </Button>
      </div>
    </section>
  );
}
