import { prisma } from "@/components/prisma";
import RequireJoinGuild from "@/components/require_join_guild"
import { Table } from "@mantine/core";
import RankTable from "./table";

export const revalidate = 10;
export const dynamic = 'force-dynamic';

export default async function RankPage() {
    const data = await prisma.vCChannel.findMany({
        orderBy: {
            vc_total_member: "desc",
        },
    });

    if (!data) {
        return (
            <RequireJoinGuild>
                <main>
                    <h1>とろサーのVC最大同時接続数一覧</h1>
                    <p>データがありません</p>
                </main>
            </RequireJoinGuild>
        );
    }

    return (
        <RequireJoinGuild>
            <main>
                <h1>とろサーのVC最大同時接続数一覧</h1>

                <RankTable data={data} />
            </main>
        </RequireJoinGuild>
    );
}