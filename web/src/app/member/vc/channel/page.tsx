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

    const data = await prisma.vCChannel.findMany({
        orderBy: {
            vc_total_member: "desc",
        },
    });

    return (
        <main>
            <h1>とろサーのVC最大同時接続数一覧</h1>

            <RankTable data={data} />
        </main>
    );
}