"use client";
import { AppShell, Burger, Group, LoadingOverlay, Skeleton, UnstyledButton } from "@mantine/core";

import styles from "./appshell.module.css";
import { useDisclosure } from "@mantine/hooks";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";


const memberLinks = [
    { title: "VC接続時間", href: "/member/vc/rank" },
    { title: "最大同時接続数", href: "/member/vc/channel" },
];

export default function AppShellNavBar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mobileMenuOpened, { toggle }] = useDisclosure();

    const { data: session, status } = useSession();
    const needsLogin = status === "unauthenticated" || session?.guildAccess === "reauthenticate";

    function navigation(onSelect?: () => void) {
        return (
            <>
                <UnstyledButton component={Link} href="/" onClick={onSelect} className={styles.control}>
                    トップ
                </UnstyledButton>
                {session?.guildAccess === "member" && memberLinks.map(link => (
                    <UnstyledButton key={link.href} component={Link} href={link.href} onClick={onSelect} className={styles.control}>
                        {link.title}
                    </UnstyledButton>
                ))}
                {needsLogin && (
                    <UnstyledButton className={styles.control} onClick={() => { onSelect?.(); void signIn("discord"); }}>
                        ログイン
                    </UnstyledButton>
                )}
                {status === "authenticated" && (
                    <UnstyledButton className={styles.control} onClick={() => { onSelect?.(); void signOut({ callbackUrl: "/" }); }}>
                        ログアウト
                    </UnstyledButton>
                )}
            </>
        );
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
                        <UnstyledButton component={Link} href="/" className={styles.logo}>
                            <Image
                                src="/toroserver-icon.png"
                                alt="とろサーBot"
                                width={30}
                                height={30}
                            />
                            とろサーBot
                        </UnstyledButton>
                        <Group ml="xl" gap={0} visibleFrom="sm">
                            {status === "loading" ? <>
                                <Skeleton height={30} width={80} />
                                <Skeleton height={30} width={110} mr={20} />
                            </> : navigation()}
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar py="md" px={4}>
                {status === "loading" ? <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} /> : navigation(toggle)}
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    )
}