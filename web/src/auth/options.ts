import type { AuthOptions, Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { JWT } from "next-auth/jwt";

async function getGuildAccess(token: JWT): Promise<Session["guildAccess"]> {
    const credentials = token.discord;
    if (!credentials?.access_token ||
        (credentials.expires_at !== undefined && credentials.expires_at <= Date.now() / 1000)) {
        return "reauthenticate";
    }

    const guildId = process.env.NEXT_PUBLIC_GUILD_ID;
    if (!guildId) return "unavailable";

    try {
        const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
            headers: { Authorization: `Bearer ${credentials.access_token}` },
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });

        if (response.status === 401 || response.status === 403) return "reauthenticate";
        if (!response.ok) return "unavailable";

        const guilds: unknown = await response.json();
        if (!Array.isArray(guilds) || !guilds.every(guild => typeof guild?.id === "string")) {
            return "unavailable";
        }

        return guilds.some(guild => guild.id === guildId) ? "member" : "nonmember";
    } catch {
        return "unavailable";
    }
}

export const authOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.CLIENT_ID ?? "",
            clientSecret: process.env.CLIENT_SECRET ?? "",
            issuer: "https://discord.com",
            authorization: { params: { scope: "identify email guilds" } },
            userinfo: "https://discord.com/api/v10/users/@me",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
    callbacks: {
        async jwt({ token, account }) {
            const credentials = account ?? token.account;
            if (credentials) {
                token.discord = {
                    access_token: credentials.access_token,
                    expires_at: credentials.expires_at,
                };
            }
            delete token.account;
            return token;
        },
        async session({ session, token }) {
            session.guildAccess = await getGuildAccess(token);
            return session;
        },
    },
} satisfies AuthOptions;
