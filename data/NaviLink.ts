export type NaviItem = {
  href: string;
  label: string;
};

export const NaviLink: NaviItem[] = [
  {
    href: "/dashboard/quests",
    label: "Квесты",
  },
  {
    href: "/dashboard/goals",
    label: "Цели квеста",
  },
  {
    href: "/dashboard/awards/raw",
    label: "Награды от трейдеров",
  },
  {
    href: "/dashboard/awards/items",
    label: "Награды (Предметы)",
  },
  {
    href: "/dashboard/awards/unlocks",
    label: "Награды (Разблокирует)",
  },
  {
    href: "/dashboard/items",
    label: "Предметы",
  },
];
