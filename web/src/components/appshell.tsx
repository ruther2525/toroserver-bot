"use client";
import { AppShell, Burger, Group, LoadingOverlay, Skeleton, UnstyledButton } from "@mantine/core";

import styles from "./appshell.module.css";
import { useDisclosure } from "@mantine/hooks";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";


const links = [
    { title: "トップ", href: "/", requireLogin: false },
    { title: "ログイン", handler: async () => { await signIn("discord"); }, requireLogin: false },
    { title: "ログアウト", handler: async () => { await signOut(); }, requireLogin: true },
    { title: "VC接続時間", href: "/member/vc/rank", requireLogin: true },
    { title: "最大同時接続数", href: "/member/vc/channel", requireLogin: true },
];

export default function AppShellNavBar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mobileMenuOpened, { toggle }] = useDisclosure();

    const { data: session, status } = useSession();
    if (status === "authenticated") {
        console.log(session);
    }

    return (
        <AppShell
            header={{
                height: 60,
            }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: {
                    desktop: true,
                    mobile: !mobileMenuOpened,
                }
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={mobileMenuOpened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <UnstyledButton component={Link} href="/" className={styles.logo}>とろサーBot</UnstyledButton>
                        <Group ml="xl" gap={0} visibleFrom="sm">
                            {status === "loading" ? <>
                                <Skeleton height={30} width={80} />
                                <Skeleton height={30} width={110} mr={20} />
                            </> : links.map((link) => {
                                if (link.requireLogin) {
                                    if (status === "authenticated" && session.user.guilds?.length > 0 && session.user.guilds.some((guild: { id: string; }) => guild.id === process.env.NEXT_PUBLIC_GUILD_ID)) {
                                        return link.handler ?
                                            <UnstyledButton key={link.title} onClick={link.handler} className={styles.control}>{link.title}</UnstyledButton>
                                            : <UnstyledButton key={link.title} href={link.href} component={Link} className={styles.control}>{link.title}</UnstyledButton>;
                                    } else {
                                        return null;
                                    }
                                } else {
                                    if (status === "authenticated" && session.user.guilds?.length > 0 && session.user.guilds.some((guild: { id: string; }) => guild.id === process.env.NEXT_PUBLIC_GUILD_ID)) {
                                        return null;
                                    } else {
                                        return link.handler ?
                                            <UnstyledButton key={link.title} onClick={link.handler} className={styles.control}>{link.title}</UnstyledButton>
                                            : <UnstyledButton key={link.title} href={link.href} component={Link} className={styles.control}>{link.title}</UnstyledButton>;
                                    }
                                }
                            })}
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                {status === "loading" ? <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} /> : <>
                    {links.map((link) => {
                        if (link.requireLogin) {
                            if (status === "authenticated" && session.user.guilds?.length > 0 && session.user.guilds.some((guild: { id: string; }) => guild.id === process.env.NEXT_PUBLIC_GUILD_ID)) {
                                return link.handler ?
                                    <UnstyledButton key={link.title} onClick={link.handler} className={styles.control}>{link.title}</UnstyledButton>
                                    : <UnstyledButton key={link.title} href={link.href} component={Link} className={styles.control}>{link.title}</UnstyledButton>;
                            } else {
                                return null;
                            }
                        } else {
                            if (status === "authenticated" && session.user.guilds?.length > 0 && session.user.guilds.some((guild: { id: string; }) => guild.id === process.env.NEXT_PUBLIC_GUILD_ID)) {
                                return null;
                            } else {
                                return link.handler ?
                                    <UnstyledButton key={link.title} onClick={link.handler} className={styles.control}>{link.title}</UnstyledButton>
                                    : <UnstyledButton key={link.title} href={link.href} component={Link} className={styles.control}>{link.title}</UnstyledButton>;
                            }
                        }
                    })}
                </>}
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    )
}