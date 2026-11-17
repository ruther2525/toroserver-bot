"use client";

import { Button, Stack } from "@mantine/core";
import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RequireJoinGuild({ access }: { access?: Session["guildAccess"] }) {
    const router = useRouter();
    const needsLogin = !access || access === "reauthenticate";

    const message = needsLogin ? "Discordでログインしてください。"
        : access === "unavailable" ? "Discordのメンバー確認に失敗しました。"
        : "このページを表示するにはとろサーに参加している必要があります。";

    return (
        <Stack align="center" justify="center" mih="80vh">
            <h1>{message}</h1>
            {needsLogin && (
                <Button onClick={() => signIn("discord", { callbackUrl: window.location.href })}>
                    ログイン
                </Button>
            )}
            {access === "unavailable" && (
                <Button onClick={() => router.refresh()}>再試行</Button>
            )}
        </Stack>
    );
}
