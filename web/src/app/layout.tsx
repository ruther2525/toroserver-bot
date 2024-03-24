import type { Metadata } from "next";
import "./globals.css";

import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import AppShellNavBar from "@/components/appshell";
import NextAuthProvider from "@/components/session";

export const metadata: Metadata = {
    title: "とろサーBotページ",
    description: "とろサーBotのページです。とろサーメンバー限定",
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <NextAuthProvider>
                    <MantineProvider>
                        <AppShellNavBar>
                            {children}
                        </AppShellNavBar>
                    </MantineProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
