import { notifications } from "@mantine/notifications";
import axios from "axios";

const extractErrorMessage = (e: any) => {
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

export async function upsertParentLink(
  questId: number,
  name: string,
  seo_link: string
): Promise<{ ok: true; id?: number } | { ok: false }> {
  try {
    const resp = await axios.post(`/api/quest_links/parent/upsert`, {
      quest_id: questId,
      seo_link,
      name,
    });
    notifications.show({
      color: "green",
      title: "Сохранено",
      message: "Связь с предыдущим квестом сохранена",
    });
    const id = resp?.data?.id ?? resp?.data?.link?.id;
    return { ok: true, id };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    notifications.show({
      color: "red",
      title: "Ошибка",
      message: extractErrorMessage(e),
    });
    return { ok: false };
  }
}

export async function upsertNextLink(
  questId: number,
  name: string,
  seo_link: string
): Promise<{ ok: true; id?: number } | { ok: false }> {
  try {
    const resp = await axios.post(`/api/quest_links/next/upsert`, {
      quest_id: questId,
      seo_link,
      name,
    });
    notifications.show({
      color: "green",
      title: "Сохранено",
      message: "Связь со следующим квестом сохранена",
    });
    const id = resp?.data?.id ?? resp?.data?.link?.id;
    return { ok: true, id };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    notifications.show({
      color: "red",
      title: "Ошибка",
      message: extractErrorMessage(e),
    });
    return { ok: false };
  }
}

export async function deleteParentLink(link_id: number | string): Promise<boolean> {
  try {
    await axios.delete(`/api/quest_links/parent/${encodeURIComponent(link_id)}`);
    notifications.show({
      color: "green",
      title: "Удалено",
      message: "Связь с предыдущим квестом удалена",
    });
    return true;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    notifications.show({
      color: "red",
      title: "Ошибка",
      message: extractErrorMessage(e),
    });
    return false;
  }
}

export async function deleteNextLink(link_id: number | string): Promise<boolean> {
  try {
    await axios.delete(`/api/quest_links/next/${encodeURIComponent(link_id)}`);
    notifications.show({
      color: "green",
      title: "Удалено",
      message: "Связь со следующим квестом удалена",
    });
    return true;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    notifications.show({
      color: "red",
      title: "Ошибка",
      message: extractErrorMessage(e),
    });
    return false;
  }
}
