/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Table } from "@mantine/core";
import Image from "next/image";
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
    const [dataNowTime, dataNowTimeSet] = useState<{
        discord_name: string | null;
        vc_total_sec: string | null;
        vc_total_sec_hour: string | null;
        discord_avatar: string | null;
        vc_last_join_time: Date | null;
        vc_last_leave_time: Date | null;
    }[]>([]);
    const [notFoundSrc, setNotfoundSrc] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const dataNowTime = data.map((user, index) => {
                const nowTime = new Date();
                const joinTime = user.vc_last_join_time;
                const leaveTime = user.vc_last_leave_time;
                const isInVC = joinTime && (!leaveTime || joinTime.getTime() > leaveTime.getTime());

                if (!joinTime) {
                    return {
                        discord_name: isInVC ? user.discord_name + " (📢)" : user.discord_name,
                        vc_total_sec: "データなし",
                        vc_total_sec_hour: "データなし",
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                } else if (
                    !leaveTime
                    || joinTime.getTime() > leaveTime.getTime()
                ) {
                    const count = Math.floor((nowTime.getTime() - joinTime.getTime()) / 1000) + (user.vc_total_sec ?? 0);
                    return {
                        discord_name: isInVC ? user.discord_name + " (📢)" : user.discord_name,
                        vc_total_sec: count + "秒",
                        vc_total_sec_hour: Math.floor(count / 3600) + "時間" + Math.floor(count % 3600 / 60) + "分",
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                } else if (joinTime.getTime() < leaveTime.getTime()) {
                    return {
                        discord_name: user.discord_name,
                        vc_total_sec: (user.vc_total_sec ?? 0) + "秒",
                        vc_total_sec_hour: Math.floor((user.vc_total_sec ?? 0) / 3600) + "時間" + Math.floor((user.vc_total_sec ?? 0) % 3600 / 60) + "分",
                        discord_avatar: user.discord_avatar,
                        vc_last_join_time: user.vc_last_join_time,
                        vc_last_leave_time: user.vc_last_leave_time,
                    };
                }

                return {
                    discord_name: user.discord_name,
                    vc_total_sec: "データなし",
                    vc_total_sec_hour: "データなし",
                    discord_avatar: user.discord_avatar,
                    vc_last_join_time: user.vc_last_join_time,
                    vc_last_leave_time: user.vc_last_leave_time,
                };
            });

            dataNowTimeSet(dataNowTime);
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
                {dataNowTime.sort((a, b) => {
                    if (a.vc_total_sec && b.vc_total_sec) {
                        return Number(b.vc_total_sec.replace('秒', '')) - Number(a.vc_total_sec.replace('秒', ''));
                    }
                    return 0;
                }).map((user, index) => (
                    <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                            }}>
                                <img src={user.discord_avatar ?? ""} alt={user.discord_name + "'s icon"} width={20} height={20} onError={e => {
                                    e.currentTarget.src = "/toroserver-icon.png";
                                    e.currentTarget.onerror = null;
                                }} />
                                {user.discord_name}
                            </div>
                        </Table.Td>
                        <Table.Td>{user.vc_total_sec}</Table.Td>
                        <Table.Td>{user.vc_total_sec_hour}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}