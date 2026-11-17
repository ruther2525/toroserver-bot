import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";
import { prisma } from "@/components/prisma";
import RequireJoinGuild from "@/components/require_join_guild";
import RankTable from "./table";

export const dynamic = 'force-dynamic';

export default async function RankPage() {
    const session = await getServerSession(authOptions);
    if (session?.guildAccess !== "member") {
        return <RequireJoinGuild access={session?.guildAccess} />;
    }

    const data = await prisma.user.findMany({
        select: {
            discord_avatar: true,
            discord_name: true,
            vc_last_join_time: true,
            vc_last_leave_time: true,
            vc_total_sec: true,
            guild_joined_date: true,
        },
        orderBy: {
            vc_total_sec: "desc",
        },
    });

    return (
        <main>
            <h1>とろサーのVC参加時間一覧</h1>

            <RankTable data={data} />
        </main>
    );
}