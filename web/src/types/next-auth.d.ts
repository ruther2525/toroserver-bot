import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            name: string;
            display_name: string;
            email: string;
            image: string;
            access_token: string;
            guilds: any[];
        } & DefaultSession["user"];
    }
    interface Account {
        access_token: string;
        global_name: string;
        provider: string;
        type: string;
        providerAccountId: string;
        token_type: string;
        access_token: string;
        expires_at: nunber;
        refresh_token: string;
        scope: string;
        guilds: any[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        account?: {
            access_token: string;
            global_name: string;
            provider: string;
            type: string;
            providerAccountId: string;
            token_type: string;
            access_token: string;
            expires_at: nunber;
            refresh_token: string;
            scope: string;
            guilds: any[];
        }
    }
}