import "next-auth";
import "next-auth/jwt";

interface DiscordCredentials {
    access_token?: string;
    expires_at?: number;
}

declare module "next-auth" {
    interface Session {
        guildAccess: "member" | "nonmember" | "reauthenticate" | "unavailable";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        discord?: DiscordCredentials;
        account?: DiscordCredentials;
    }
}
