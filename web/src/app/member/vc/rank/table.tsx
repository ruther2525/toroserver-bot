"use client";
import { Table } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

export default function RankTable({
    data,
}: {
    data: {
        discord_name: string | null;
        vc_total_sec: number | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
    }[];
    }) {
    const [countsNowTime, countsNowTimeSet] = useState<string[]>([]);
    const [countsNowTimeHour, countsNowTimeHourSet] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const countsNowTime = data.map((user) => {
                const nowTime = new Date();
                const joinTime = user.vc_last_join_time;
                const leaveTime = user.vc_last_leave_time;

                if (!joinTime || !leaveTime) {
                    return "データなし";
                }

                if (joinTime.getTime() < leaveTime.getTime()) {
                    return user.vc_total_sec + "秒";
                }

                const count = Math.floor((nowTime.getTime() - joinTime.getTime()) / 1000) + (user.vc_total_sec ?? 0);
                return count + "秒";
            });

            const countsNowTimeHour = data.map((user) => {
                const nowTime = new Date();
                const joinTime = user.vc_last_join_time;
                const leaveTime = user.vc_last_leave_time;

                if (!joinTime || !leaveTime) {
                    return "データなし";
                }

                if (joinTime.getTime() < leaveTime.getTime()) {
                    return Math.floor((user.vc_total_sec ?? 0) / 3600) + "時間" + Math.floor((user.vc_total_sec ?? 0) % 3600 / 60) + "分";
                }

                const count = Math.floor((nowTime.getTime() - joinTime.getTime()) / 1000) + (user.vc_total_sec ?? 0);
                return Math.floor(count / 3600) + "時間" + Math.floor(count % 3600 / 60) + "分";
            });

            countsNowTimeSet(countsNowTime);
            countsNowTimeHourSet(countsNowTimeHour);
        }, 1000);

        return () => clearInterval(interval);
    }, [data]);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>名前</Table.Th>
                    <Table.Th>累計VC参加秒数</Table.Th>
                    <Table.Th>(時間換算)</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.map((user, index) => (
                    <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                            {
                                (user.vc_last_join_time ?? new Date()) > (user.vc_last_leave_time ?? new Date())
                                ? user.discord_name + " (📢) "
                                : user.discord_name
                            }
                        </Table.Td>
                        <Table.Td>
                            {countsNowTime[index]}
                        </Table.Td>
                        <Table.Td>
                            {countsNowTimeHour[index]}
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}