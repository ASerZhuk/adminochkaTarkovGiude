"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";

function LoginMessages() {
  const search = useSearchParams();
  const info = search.get("info");
  const err = search.get("error");
  return (
    <Stack gap="xs" mb="sm">
      {info && (
        <Alert color="teal" variant="light" title="Сообщение">
          {info}
        </Alert>
      )}
      {err && (
        <Alert color="red" variant="light" title="Ошибка">
          {err}
        </Alert>
      )}
    </Stack>
  );
}

export default function AuthClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Ошибка входа");
      }
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Paper withBorder radius="md" p="xl" maw={420} w="100%">
        <Title order={3} mb={4}>
          Вход в админку
        </Title>
        <Text c="dimmed" size="sm" mb="md">
          Доступ только для администраторов
        </Text>
        <Suspense fallback={null}>
          <LoginMessages />
        </Suspense>
        {error && (
          <Alert color="red" variant="light" title="Ошибка" mb="sm">
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Логин"
              placeholder="Введите логин"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              autoFocus
            />
            <PasswordInput
              label="Пароль"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={loading} fullWidth>
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
