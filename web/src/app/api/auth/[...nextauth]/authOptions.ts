import { SessionOptions, User, Account, Profile, Session, CallbacksOptions, AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { CredentialInput } from "next-auth/providers/credentials";

export const authHandler = {
    providers: [
        DiscordProvider({
            clientId: process.env.CLIENT_ID ?? "",
            clientSecret: process.env.CLIENT_SECRET ?? "",
            authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    } as SessionOptions,

    callbacks: {
        jwt: async ({ token, user, account, profile, isNewUser }: { token: JWT; user: User | AdapterUser; account: Account | null; profile: Profile | null; isNewUser: boolean | null; }) => {
            token.account = account? account : token.account;
            return token;
        },
        session: async ({ session, token, user }: { session: Session; token: JWT; user: AdapterUser; }) => {
            session.user = {
                ...session.user,
                access_token: token.account?.access_token ?? "",
                display_name: token.account?.global_name ?? "",
            };

            const guilds = await fetch(process.env.NEXTAUTH_URL + "/api/guildCheck/" + token.account?.access_token).then((res) => res.json());
            session.user.guilds = guilds;

            return session;
        },
        signIn: async ({ user, account, profile, email, credentials }: { user: User | AdapterUser, account: Account | null, profile: Profile | null, email: { verificationRequest: boolean | null } | null, credentials: Record<string, CredentialInput> | null }) => {
            return true;
        },
        redirect: async ({ url, baseUrl }: { url: string; baseUrl: string; }) => {
            return baseUrl;
        }
    } as CallbacksOptions,
} as AuthOptions;