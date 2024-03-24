"use client";

import { Button, Center, LoadingOverlay, Space } from "@mantine/core";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function RequireJoinGuild({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data: session, status } = useSession();
    
    if (status === "loading") {
        return (
            <>
                <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                {children}
            </>
        )
    } else if (status === "authenticated" && session.user.guilds?.length > 0 && session.user.guilds.some((guild: { id: string; }) => guild.id === process.env.NEXT_PUBLIC_GUILD_ID)) {
        return children;
    } else {
        return (
            <div style={{
                width: "100%",
                height: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <h1>このページを表示するにはとろサーに参加している必要があります。</h1>
                {status === "unauthenticated" && <>
                    <Space h="xl" />
                    <Button onClick={async () => {
                        await signIn("discord", { callbackUrl: window.location.href });
                    }} color="blue" size="lg">ログイン</Button>
                </>}
            </div>
        );
    }
}