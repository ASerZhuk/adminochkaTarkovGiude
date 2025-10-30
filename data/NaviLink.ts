export type NaviChild = {
  href: string;
  label: string;
}

export type NaviItem = {
  label: string;
  href?: string;
  children?: NaviChild[];
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
    label: "Карты",
    children: [
      { href: "/dashboard/maps", label: "Карты" },
      { href: "/dashboard/layers", label: "Слои" },
    ],
  },
  {
    href: "/dashboard/items",
    label: "Предметы",
  },
];
