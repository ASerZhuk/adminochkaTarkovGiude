"use client";

import React from "react";
import Link from "next/link";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NaviLink } from "../../data/NaviLink";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const onLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login?info=Вы вышли из аккаунта";
    }
  };

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard`)}>
            TarkovGuide Админ Панель
          </div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section grow my="md" component={ScrollArea} px="md">
          {NaviLink.map((nav, index) => {
            const isActive =
              pathname === nav.href || pathname.startsWith(`${nav.href}/`);
            return (
              <NavLink
                key={index}
                component={Link}
                href={nav.href}
                label={(nav as any).label}
                active={isActive}
              />
            );
          })}
        </AppShell.Section>
        <AppShell.Section p="md">
          <div className="cursor-pointer hover:text-red-800" onClick={onLogout}>
            Выйти
          </div>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
